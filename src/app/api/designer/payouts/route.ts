import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/designer/payouts — get designer earnings/payouts history
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const profile = await queryOne<{ id: number }>(
      `SELECT id FROM designer_profiles WHERE user_id = ?`,
      [user.id]
    );

    if (!profile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    // Get payouts
    const payouts = await query<unknown[]>(
      `SELECT 
        dpay.id,
        dpay.amount,
        dpay.currency,
        dpay.platform_fee,
        dpay.net_amount,
        dpay.status,
        dpay.paid_at,
        dpay.created_at,
        dp.title as project_title,
        dp.code as project_code
      FROM designer_payouts dpay
      LEFT JOIN design_projects dp ON dp.id = dpay.design_project_id
      WHERE dpay.designer_profile_id = ?
      ORDER BY dpay.created_at DESC
      LIMIT ? OFFSET ?`,
      [profile.id, limit, offset]
    );

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM designer_payouts WHERE designer_profile_id = ?`,
      [profile.id]
    );

    // Get summary stats
    const stats = await queryOne<{
      total_earned: number;
      total_fees: number;
      total_net: number;
      pending_amount: number;
      completed_count: number;
    }>(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_earned,
        COALESCE(SUM(platform_fee), 0) as total_fees,
        COALESCE(SUM(net_amount), 0) as total_net,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_count
      FROM designer_payouts
      WHERE designer_profile_id = ?`,
      [profile.id]
    );

    return NextResponse.json({
      success: true,
      data: payouts,
      stats: stats || { total_earned: 0, total_fees: 0, total_net: 0, pending_amount: 0, completed_count: 0 },
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit),
      },
    });
  } catch (error) {
    console.error("GET designer/payouts error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
