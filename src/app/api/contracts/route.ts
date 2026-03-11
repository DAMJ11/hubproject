import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/contracts - Listar contratos según rol
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const isAdmin = hasRole(user, "admin");

    // Brands y manufacturers necesitan companyId; admin no
    if (!isAdmin && !user.companyId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    let sql: string;
    let params: (string | number)[] = [];

    if (isAdmin) {
      // Admin ve todos los contratos sin filtro de empresa
      sql = `SELECT ct.id, ct.code, r.title as rfq_title,
                    bc.name as brand_name,
                    mc.name as manufacturer_name,
                    ct.total_amount, ct.status, ct.start_date, ct.expected_end_date,
                    (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id) as milestones_count,
                    (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id AND status = 'completed') as milestones_completed,
                    ct.created_at
             FROM contracts ct
             JOIN rfq_projects r ON ct.rfq_id = r.id
             JOIN companies bc ON ct.brand_company_id = bc.id
             JOIN companies mc ON ct.manufacturer_company_id = mc.id
             WHERE 1=1`;
    } else {
      sql = `SELECT ct.id, ct.code, r.title as rfq_title,
                    CASE
                      WHEN ct.brand_company_id = ? THEN mc.name
                      ELSE bc.name
                    END as counterpart_name,
                    ct.total_amount, ct.status, ct.start_date, ct.expected_end_date,
                    (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id) as milestones_count,
                    (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id AND status = 'completed') as milestones_completed,
                    ct.created_at
             FROM contracts ct
             JOIN rfq_projects r ON ct.rfq_id = r.id
             JOIN companies bc ON ct.brand_company_id = bc.id
             JOIN companies mc ON ct.manufacturer_company_id = mc.id
             WHERE (ct.brand_company_id = ? OR ct.manufacturer_company_id = ?)`;  
      params = [user.companyId!, user.companyId!, user.companyId!];
    }

    if (status) {
      sql += ` AND ct.status = ?`;
      params.push(status);
    }

    const safeLimit = Math.trunc(limit);
    const safeOffset = Math.trunc(offset);
    sql += ` ORDER BY ct.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const contracts = await query(sql, params);

    return NextResponse.json({ success: true, data: contracts, page, limit });
  } catch (error) {
    console.error("GET /api/contracts error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
