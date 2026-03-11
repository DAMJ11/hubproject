import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/proposals/mine - Propuestas del fabricante actual
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    if (!hasRole(user, "manufacturer")) {
      return NextResponse.json({ success: false, message: "Only manufacturers" }, { status: 403 });
    }

    const proposals = await query(
      `SELECT p.id, p.rfq_id, p.unit_price, p.total_price, p.lead_time_days,
              p.status, p.green_score, p.submitted_at,
              r.code as rfq_code, r.title as rfq_title, r.status as rfq_status,
              sc.name as category_name
       FROM proposals p
       JOIN rfq_projects r ON p.rfq_id = r.id
       JOIN service_categories sc ON r.category_id = sc.id
       WHERE p.manufacturer_company_id = ?
       ORDER BY p.submitted_at DESC`,
      [user.companyId]
    );

    return NextResponse.json({ success: true, data: proposals });
  } catch (error) {
    console.error("GET /api/proposals/mine error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
