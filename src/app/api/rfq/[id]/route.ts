import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// GET /api/rfq/[id] - Detalle de un RFQ con materiales y adjuntos
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

    // Consulta principal
    const rfq = await queryOne(
      `SELECT r.*, sc.name as category_name,
              c.name as brand_name, c.city as brand_city, c.latitude as brand_latitude, c.longitude as brand_longitude
       FROM rfq_projects r
       JOIN companies c ON r.brand_company_id = c.id
       JOIN service_categories sc ON r.category_id = sc.id
       WHERE r.id = ?`,
      [rfqId]
    );

    if (!rfq) {
      return NextResponse.json({ success: false, message: "RFQ not found" }, { status: 404 });
    }

    // Materiales y adjuntos en paralelo (ligero)
    const [materials, attachments] = await Promise.all([
      query(`SELECT * FROM rfq_materials WHERE rfq_id = ?`, [rfqId]),
      query(`SELECT * FROM rfq_attachments WHERE rfq_id = ?`, [rfqId]),
    ]);

    return NextResponse.json({
      success: true,
      data: { ...(rfq as Record<string, unknown>), materials, attachments },
    });
  } catch (error) {
    console.error("GET /api/rfq/[id] error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
