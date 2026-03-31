import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { rfqCreateSchema } from "@/lib/validations/rfq";

// GET /api/rfq - Listar proyectos RFQ
// Marcas: ven sus propios RFQs. Fabricantes: ven RFQs abiertos. Admin: ve todos.
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
        const countOnly = searchParams.get("countOnly") === "true";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

        let fromWhereSql = `FROM rfq_projects r
          JOIN companies c ON r.brand_company_id = c.id
          JOIN service_categories sc ON r.category_id = sc.id
          WHERE 1=1`;
    const params: (string | number)[] = [];

    // Filtrar por rol
    if (hasRole(user, "brand")) {
      if (!user.companyId || !Number.isFinite(Number(user.companyId))) {
        return NextResponse.json({ success: false, message: "Brand user without valid company" }, { status: 403 });
      }
      fromWhereSql += ` AND r.brand_company_id = ?`;
      params.push(Number(user.companyId));
    } else if (hasRole(user, "manufacturer")) {
      if (!user.companyId || !Number.isFinite(Number(user.companyId))) {
        return NextResponse.json({ success: false, message: "Manufacturer user without valid company" }, { status: 403 });
      }
      // Fabricantes ven oportunidades abiertas que encajan con sus capacidades
      // o RFQs donde ya participaron con propuesta.
      fromWhereSql += `
        AND (
          (
            r.status = 'open'
            AND EXISTS (
              SELECT 1
              FROM manufacturer_capabilities mc
              WHERE mc.company_id = ?
                AND mc.is_active = TRUE
                AND mc.category_id = r.category_id
                AND (mc.min_order_qty IS NULL OR r.quantity >= mc.min_order_qty)
                AND (mc.max_monthly_capacity IS NULL OR r.quantity <= mc.max_monthly_capacity)
            )
          )
          OR EXISTS (
            SELECT 1
            FROM proposals p
            WHERE p.rfq_id = r.id
              AND p.manufacturer_company_id = ?
          )
        )`;
      params.push(Number(user.companyId), Number(user.companyId));
    }
    // Admin ve todos

    if (status) {
      fromWhereSql += ` AND r.status = ?`;
      params.push(status);
    }

    if (categoryId) {
      const parsedCategoryId = Number(categoryId);
      if (!Number.isFinite(parsedCategoryId)) {
        return NextResponse.json({ success: false, message: "Invalid categoryId" }, { status: 400 });
      }
      fromWhereSql += ` AND r.category_id = ?`;
      params.push(parsedCategoryId);
    }

    if (countOnly) {
      const countRows = await query<Array<{ total: number }>>(
        `SELECT COUNT(*) as total ${fromWhereSql}`,
        params
      );

      return NextResponse.json({
        success: true,
        total: Number(countRows?.[0]?.total ?? 0),
      });
    }

    let sql = `SELECT r.id, r.code, r.title, sc.name as category_name, r.quantity,
           r.budget_min, r.budget_max, r.deadline, r.proposals_deadline,
           r.status, r.proposals_count, r.sustainability_priority,
           c.name as brand_name, c.city as brand_city, r.created_at
         ${fromWhereSql}`;

    const safeLimit = Math.trunc(limit);
    const safeOffset = Math.trunc(offset);
    sql += ` ORDER BY r.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const rfqs = await query(sql, params);

    return NextResponse.json({ success: true, data: rfqs, page, limit });
  } catch (error) {
    console.error("GET /api/rfq error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/rfq - Crear proyecto RFQ (solo marcas)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "brand", "admin") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Only brands can create RFQs" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = rfqCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    const { categoryId, title, description, quantity, budgetMin, budgetMax, deadline, proposalsDeadline, requiresSample, preferredMaterials, sustainabilityPriority, materials } = parsed.data;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Generar cÃ³digo secuencial
      const [countResult] = await connection.execute(`SELECT COUNT(*) as c FROM rfq_projects`);
      const count = (countResult as { c: number }[])[0].c + 1;
      const code = `RFQ-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

      const [rfqResult] = await connection.execute(
        `INSERT INTO rfq_projects (code, brand_company_id, created_by_user_id, category_id, title, description,
          quantity, budget_min, budget_max, deadline, proposals_deadline, status, requires_sample,
          preferred_materials, sustainability_priority, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, NOW(), NOW())`,
        [code, user.companyId, user.id, categoryId, title.trim(), description.trim(),
          quantity, budgetMin || null, budgetMax || null, deadline || null, proposalsDeadline || null,
          requiresSample ?? false, preferredMaterials || null, sustainabilityPriority ?? false]
      );
      const rfqId = (rfqResult as { insertId: number }).insertId;

      // Insertar materiales si los hay
      if (Array.isArray(materials) && materials.length > 0) {
        for (const mat of materials) {
          await connection.execute(
            `INSERT INTO rfq_materials (rfq_id, material_type, composition, recycled_percentage, specifications)
             VALUES (?, ?, ?, ?, ?)`,
            [rfqId, mat.materialType, mat.composition || null, mat.recycledPercentage || 0, mat.specifications || null]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({ success: true, message: "RFQ created", data: { id: rfqId, code } }, { status: 201 });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("POST /api/rfq error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/rfq - Actualizar RFQ (solo marca dueÃ±a, solo draft u open)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || (!user.companyId && !hasRole(user, "admin"))) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status: newStatus, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    // Verificar propiedad
    const rfq = await queryOne<{ brand_company_id: number; status: string }>(
      `SELECT brand_company_id, status FROM rfq_projects WHERE id = ?`, [id]
    );

    if (!rfq) {
      return NextResponse.json({ success: false, message: "RFQ not found" }, { status: 404 });
    }

    if (!hasRole(user, "admin") && rfq.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Solo permitir ediciÃ³n en draft/open
    if (!["draft", "open"].includes(rfq.status) && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Cannot edit RFQ in current status" }, { status: 400 });
    }

    const allowed: Record<string, string> = {
      title: "title", description: "description", quantity: "quantity",
      budgetMin: "budget_min", budgetMax: "budget_max", deadline: "deadline",
      proposalsDeadline: "proposals_deadline", requiresSample: "requires_sample",
      preferredMaterials: "preferred_materials", sustainabilityPriority: "sustainability_priority",
    };

    const sets: string[] = [];
    const params: (string | number | boolean | null)[] = [];

    // Permitir cambio de status
    if (newStatus) {
      sets.push(`status = ?`);
      params.push(newStatus);
    }

    for (const [camel, col] of Object.entries(allowed)) {
      if (fields[camel] !== undefined) {
        sets.push(`${col} = ?`);
        params.push(fields[camel]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 });
    }

    params.push(id);
    await query(`UPDATE rfq_projects SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`, params);

    return NextResponse.json({ success: true, message: "RFQ updated" });
  } catch (error) {
    console.error("PUT /api/rfq error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
