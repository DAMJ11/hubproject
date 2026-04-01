import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// GET /api/notifications — list user notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 50);
    const offset = Math.max(Number(request.nextUrl.searchParams.get("offset")) || 0, 0);
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

    const where = unreadOnly
      ? "WHERE user_id = ? AND is_read = FALSE"
      : "WHERE user_id = ?";

    const rows = await query<{
      id: number; title: string; message: string; type: string;
      reference_type: string | null; reference_id: number | null;
      is_read: boolean; read_at: string | null; created_at: string;
    }>(`SELECT id, title, message, type, reference_type, reference_id, is_read, read_at, created_at
        FROM notifications ${where}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      unreadOnly ? [user.id] : [user.id]
    );

    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM notifications ${where}`,
      unreadOnly ? [user.id] : [user.id]
    );

    const unreadRow = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [user.id]
    );

    return NextResponse.json({
      success: true,
      data: rows,
      unreadCount: unreadRow?.count ?? 0,
      total: countRow?.total ?? 0,
    });
  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, all } = body as { ids?: number[]; all?: boolean };

    if (all) {
      await query(
        "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE",
        [user.id]
      );
    } else if (Array.isArray(ids) && ids.length > 0) {
      const safeIds = ids.filter((id) => typeof id === "number" && Number.isInteger(id));
      if (safeIds.length === 0) {
        return NextResponse.json({ success: false, message: "Invalid ids" }, { status: 400 });
      }
      const placeholders = safeIds.map(() => "?").join(",");
      await query(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW()
         WHERE id IN (${placeholders}) AND user_id = ?`,
        [...safeIds, user.id]
      );
    } else {
      return NextResponse.json({ success: false, message: "Provide 'ids' array or 'all: true'" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH notifications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
