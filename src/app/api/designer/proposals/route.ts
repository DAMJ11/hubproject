import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/designer/proposals — list all proposals submitted by the current designer
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const designerProfile = await queryOne<{ id: number }>(
      `SELECT id FROM designer_profiles WHERE user_id = ?`, [user.id]
    );
    if (!designerProfile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    let whereSql = `WHERE dpr.designer_profile_id = ?`;
    const params: (string | number)[] = [designerProfile.id];

    if (status) {
      whereSql += ` AND dpr.status = ?`;
      params.push(status);
    }

    const countResult = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) as total FROM design_proposals dpr ${whereSql}`, params
    );
    const total = Number(countResult?.[0]?.total ?? 0);

    const rows = await query(
      `SELECT dpr.id, dpr.price, dpr.estimated_days, dpr.concept_notes,
              dpr.status, dpr.submitted_at, dpr.responded_at,
              dp.id as project_id, dp.code as project_code, dp.title as project_title,
              dp.category as project_category, dp.status as project_status,
              dp.budget_min, dp.budget_max, dp.currency as project_currency,
              dp.deadline as project_deadline,
              c.name as brand_name, c.logo_url as brand_logo
       FROM design_proposals dpr
       JOIN design_projects dp ON dpr.design_project_id = dp.id
       JOIN companies c ON dp.brand_company_id = c.id
       ${whereSql}
       ORDER BY dpr.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET designer proposals error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/designer/proposals?proposalId=X — designer withdraws a proposal
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const designerProfile = await queryOne<{ id: number }>(
      `SELECT id FROM designer_profiles WHERE user_id = ?`, [user.id]
    );
    if (!designerProfile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const proposalId = Number(searchParams.get("proposalId"));
    if (!Number.isFinite(proposalId)) {
      return NextResponse.json({ success: false, message: "proposalId is required" }, { status: 400 });
    }

    const proposal = await queryOne<{ id: number; status: string; design_project_id: number }>(
      `SELECT id, status, design_project_id FROM design_proposals WHERE id = ? AND designer_profile_id = ?`,
      [proposalId, designerProfile.id]
    );
    if (!proposal) {
      return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });
    }
    if (proposal.status === "accepted") {
      return NextResponse.json({ success: false, message: "Cannot withdraw an accepted proposal" }, { status: 400 });
    }

    await query(`UPDATE design_proposals SET status = 'withdrawn' WHERE id = ?`, [proposalId]);
    await query(
      `UPDATE design_projects SET proposals_count = GREATEST(proposals_count - 1, 0) WHERE id = ?`,
      [proposal.design_project_id]
    );

    return NextResponse.json({ success: true, message: "Proposal withdrawn" });
  } catch (error) {
    console.error("DELETE designer proposal error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
