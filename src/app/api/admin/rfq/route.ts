import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import pool from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { rfqCreateSchema } from "@/lib/validations/rfq";
import { createNotification } from "@/lib/notifications";

function normalizeProjectTypes(projectType: string | string[] | undefined) {
  if (Array.isArray(projectType)) return projectType.filter(Boolean);
  return projectType ? [projectType] : [];
}

// POST /api/admin/rfq — Admin/super_admin creates RFQ on behalf of a brand
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { brandCompanyId, ...rfqFields } = body;

    if (!brandCompanyId || !Number.isFinite(Number(brandCompanyId))) {
      return NextResponse.json({ success: false, message: "brandCompanyId is required" }, { status: 400 });
    }

    // Verify brand company exists and is active
    const brand = await query<Array<{ id: number; type: string; name: string }>>(
      `SELECT id, type, name FROM companies WHERE id = ? AND is_active = TRUE`,
      [Number(brandCompanyId)]
    );
    if (!brand.length || brand[0].type !== "brand") {
      return NextResponse.json({ success: false, message: "Brand company not found" }, { status: 404 });
    }

    // Get brand owner user for created_by_user_id
    const brandOwner = await query<Array<{ id: number }>>(
      `SELECT id FROM users WHERE company_id = ? AND role = 'brand' AND is_active = TRUE ORDER BY id ASC LIMIT 1`,
      [Number(brandCompanyId)]
    );
    if (!brandOwner.length) {
      return NextResponse.json({ success: false, message: "Brand has no active owner" }, { status: 400 });
    }

    const parsed = rfqCreateSchema.safeParse(rfqFields);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Invalid data" }, { status: 400 });
    }

    const { projectType, categoryId, title, description, quantity, budgetMin, budgetMax, deadline, proposalsDeadline, requiresSample, preferredMaterials, sustainabilityPriority, materials } = parsed.data;
    const projectTypes = normalizeProjectTypes(projectType);
    const serializedProjectTypes = projectTypes.length > 0 ? JSON.stringify(projectTypes) : null;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [countResult] = await connection.execute(`SELECT COUNT(*) as c FROM rfq_projects`);
      const count = (countResult as { c: number }[])[0].c + 1;
      const code = `RFQ-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

      const [rfqResult] = await connection.execute(
        `INSERT INTO rfq_projects (code, project_type, brand_company_id, created_by_user_id, created_by_admin_id, category_id, title, description,
          quantity, budget_min, budget_max, deadline, proposals_deadline, status, requires_sample,
          preferred_materials, sustainability_priority, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, NOW(), NOW())`,
        [code, serializedProjectTypes, Number(brandCompanyId), brandOwner[0].id, user.id, categoryId, title.trim(), description.trim(),
          quantity, budgetMin || null, budgetMax || null, deadline || null, proposalsDeadline || null,
          requiresSample ?? false, preferredMaterials || null, sustainabilityPriority ?? false]
      );
      const rfqId = (rfqResult as { insertId: number }).insertId;

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

      // Notify brand owner
      await createNotification({
        userId: brandOwner[0].id,
        title: "Project created on your behalf",
        message: `An administrator has created project "${title}" (${code}) on behalf of your company.`,
        type: "rfq",
        referenceType: "rfq_project",
        referenceId: rfqId,
      });

      return NextResponse.json({ success: true, message: "RFQ created for brand", data: { id: rfqId, code } }, { status: 201 });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("POST /api/admin/rfq error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
