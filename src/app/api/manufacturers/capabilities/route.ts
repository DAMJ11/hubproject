import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/manufacturers/capabilities?companyId=X
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = Number(searchParams.get("companyId")) || user.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, message: "companyId required" }, { status: 400 });
    }

    const capabilities = await query(
      `SELECT mc.id, mc.company_id, mc.category_id, sc.name as category_name,
              mc.min_order_qty, mc.max_monthly_capacity, mc.lead_time_days, mc.description, mc.is_active
       FROM manufacturer_capabilities mc
       JOIN service_categories sc ON mc.category_id = sc.id
       WHERE mc.company_id = ? AND mc.is_active = TRUE
       ORDER BY sc.sort_order`,
      [companyId]
    );

    return NextResponse.json({ success: true, data: capabilities });
  } catch (error) {
    console.error("GET capabilities error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/manufacturers/capabilities
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "manufacturer", "admin") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, minOrderQty, maxMonthlyCapacity, leadTimeDays, description } = body;

    if (!categoryId) {
      return NextResponse.json({ success: false, message: "categoryId is required" }, { status: 400 });
    }

    await query(
      `INSERT INTO manufacturer_capabilities (company_id, category_id, min_order_qty, max_monthly_capacity, lead_time_days, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE min_order_qty = VALUES(min_order_qty), max_monthly_capacity = VALUES(max_monthly_capacity),
                                lead_time_days = VALUES(lead_time_days), description = VALUES(description), is_active = TRUE`,
      [user.companyId, categoryId, minOrderQty || 1, maxMonthlyCapacity || null, leadTimeDays || null, description || null]
    );

    return NextResponse.json({ success: true, message: "Capability saved" }, { status: 201 });
  } catch (error) {
    console.error("POST capabilities error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/manufacturers/capabilities?id=X
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "manufacturer", "admin") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    await query(
      `UPDATE manufacturer_capabilities SET is_active = FALSE WHERE id = ? AND company_id = ?`,
      [id, user.companyId]
    );

    return NextResponse.json({ success: true, message: "Capability removed" });
  } catch (error) {
    console.error("DELETE capabilities error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
