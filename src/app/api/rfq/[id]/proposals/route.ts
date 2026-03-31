import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { calculateGreenScore, haversineKm } from "@/lib/green-score";
import { createNotification } from "@/lib/notifications";

// GET /api/rfq/[id]/proposals - Ver propuestas de un RFQ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const rfqId = Number(id);

    // Verificar acceso
    const rfq = await queryOne<{ brand_company_id: number }>(
      `SELECT brand_company_id FROM rfq_projects WHERE id = ?`, [rfqId]
    );
    if (!rfq) {
      return NextResponse.json({ success: false, message: "RFQ not found" }, { status: 404 });
    }

    // Marcas ven todas las propuestas de su RFQ. Fabricantes solo su propia propuesta.
    let sql = `SELECT p.id, p.rfq_id, p.manufacturer_company_id, p.unit_price, p.total_price,
                      p.lead_time_days, p.proposed_materials, p.recycled_percentage, p.notes,
                      p.status, p.green_score, p.distance_km, p.submitted_at,
                      c.name as manufacturer_name, c.city as manufacturer_city, c.is_verified as manufacturer_is_verified,
                      c.description as manufacturer_description,
                      (SELECT COUNT(*) FROM manufacturer_certifications mc WHERE mc.company_id = c.id AND (mc.expires_at IS NULL OR mc.expires_at >= CURDATE())) as certifications_count
               FROM proposals p
               JOIN companies c ON p.manufacturer_company_id = c.id
               WHERE p.rfq_id = ?`;
    const params_q: (string | number)[] = [rfqId];

    if (hasRole(user, "manufacturer")) {
      sql += ` AND p.manufacturer_company_id = ?`;
      params_q.push(user.companyId!);
    } else if (hasRole(user, "brand") && rfq.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    sql += ` ORDER BY p.green_score DESC, p.total_price ASC`;

    const proposals = await query(sql, params_q);

    return NextResponse.json({ success: true, data: proposals });
  } catch (error) {
    console.error("GET proposals error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/rfq/[id]/proposals - Fabricante envía propuesta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "manufacturer") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Only manufacturers can submit proposals" }, { status: 403 });
    }

    const { id } = await params;
    const rfqId = Number(id);

    // Verificar que el RFQ está abierto
    const rfq = await queryOne<{ status: string; brand_company_id: number; quantity: number }>(
      `SELECT status, brand_company_id, quantity FROM rfq_projects WHERE id = ?`, [rfqId]
    );
    if (!rfq || rfq.status !== "open") {
      return NextResponse.json({ success: false, message: "RFQ not available for proposals" }, { status: 400 });
    }

    // Verificar que no haya enviado propuesta ya
    const existing = await queryOne(
      `SELECT id FROM proposals WHERE rfq_id = ? AND manufacturer_company_id = ?`,
      [rfqId, user.companyId]
    );
    if (existing) {
      return NextResponse.json({ success: false, message: "You already submitted a proposal for this RFQ" }, { status: 409 });
    }

    const body = await request.json();
    const { unitPrice, leadTimeDays, proposedMaterials, recycledPercentage, notes } = body;

    if (!unitPrice || !leadTimeDays) {
      return NextResponse.json({ success: false, message: "unitPrice and leadTimeDays are required" }, { status: 400 });
    }

    const totalPrice = unitPrice * rfq.quantity;
    const recycled = Math.min(100, Math.max(0, recycledPercentage || 0));

    // Calcular distancia y green score
    const [brandCompany, mfrCompany, certs, avgRatingResult] = await Promise.all([
      queryOne<{ latitude: number | null; longitude: number | null }>(
        `SELECT latitude, longitude FROM companies WHERE id = ?`, [rfq.brand_company_id]
      ),
      queryOne<{ latitude: number | null; longitude: number | null }>(
        `SELECT latitude, longitude FROM companies WHERE id = ?`, [user.companyId]
      ),
      query<{ name: string }[]>(
        `SELECT name FROM manufacturer_certifications WHERE company_id = ? AND (expires_at IS NULL OR expires_at >= CURDATE())`,
        [user.companyId]
      ),
      queryOne<{ avg_rating: number }>(
        `SELECT COALESCE(AVG(r.rating), 0) as avg_rating FROM reviews r
         JOIN contracts ct ON r.contract_id = ct.id
         WHERE ct.manufacturer_company_id = ?`, [user.companyId]
      ),
    ]);

    let distanceKm: number | null = null;
    if (brandCompany?.latitude && brandCompany?.longitude && mfrCompany?.latitude && mfrCompany?.longitude) {
      distanceKm = Math.round(haversineKm(
        brandCompany.latitude, brandCompany.longitude,
        mfrCompany.latitude, mfrCompany.longitude
      ) * 100) / 100;
    }

    const greenScoreResult = calculateGreenScore({
      distanceKm,
      recycledPercentage: recycled,
      certifications: (certs || []).map(c => c.name),
      avgRating: avgRatingResult?.avg_rating || 0,
    });

    // Insertar propuesta + actualizar contador en transacción
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        `INSERT INTO proposals (rfq_id, manufacturer_company_id, submitted_by_user_id, unit_price, total_price,
          lead_time_days, proposed_materials, recycled_percentage, notes, status, green_score, distance_km)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
        [rfqId, user.companyId, user.id, unitPrice, totalPrice, leadTimeDays,
          proposedMaterials || null, recycled, notes || null, greenScoreResult.total, distanceKm]
      );

      await connection.execute(
        `UPDATE rfq_projects SET proposals_count = proposals_count + 1, updated_at = NOW() WHERE id = ?`,
        [rfqId]
      );

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

    // Notify brand owner about new proposal
    const brandUser = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE company_id = ? LIMIT 1",
      [rfq.brand_company_id]
    );
    if (brandUser) {
      const mfrName = await queryOne<{ name: string }>(
        "SELECT name FROM companies WHERE id = ?",
        [user.companyId]
      );
      createNotification({
        userId: brandUser.id,
        title: "Nueva propuesta recibida",
        message: `${mfrName?.name || "Un fabricante"} envió una propuesta para tu RFQ.`,
        type: "proposal",
        referenceType: "rfq",
        referenceId: rfqId,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Proposal submitted",
      data: { greenScore: greenScoreResult },
    }, { status: 201 });
  } catch (error) {
    console.error("POST proposal error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
