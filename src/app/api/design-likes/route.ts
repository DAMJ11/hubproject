import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// POST /api/design-likes — toggle like on a portfolio item
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { portfolioItemId } = body;

    if (!portfolioItemId || !Number.isFinite(Number(portfolioItemId))) {
      return NextResponse.json({ success: false, message: "portfolioItemId is required" }, { status: 400 });
    }

    // Verify the item exists and is public
    const item = await queryOne<{ id: number; designer_profile_id: number }>(
      `SELECT id, designer_profile_id FROM designer_portfolio_items WHERE id = ? AND is_public = TRUE`,
      [Number(portfolioItemId)]
    );
    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }

    // Check if already liked
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM design_likes WHERE user_id = ? AND designer_portfolio_item_id = ?`,
      [user.id, item.id]
    );

    if (existing) {
      // Unlike
      await query(`DELETE FROM design_likes WHERE id = ?`, [existing.id]);
      await query(`UPDATE designer_portfolio_items SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?`, [item.id]);
      return NextResponse.json({ success: true, liked: false });
    } else {
      // Like
      await query(
        `INSERT INTO design_likes (user_id, designer_portfolio_item_id) VALUES (?, ?)`,
        [user.id, item.id]
      );
      await query(`UPDATE designer_portfolio_items SET likes_count = likes_count + 1 WHERE id = ?`, [item.id]);
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error("POST design-likes error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// GET /api/design-likes?itemIds=1,2,3 — check which items the user has liked
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const itemIdsStr = searchParams.get("itemIds");
    if (!itemIdsStr) {
      return NextResponse.json({ success: true, data: [] });
    }

    const itemIds = itemIdsStr.split(",").map(Number).filter(Number.isFinite);
    if (itemIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const placeholders = itemIds.map(() => "?").join(",");
    const likes = await query<Array<{ designer_portfolio_item_id: number }>>(
      `SELECT designer_portfolio_item_id FROM design_likes WHERE user_id = ? AND designer_portfolio_item_id IN (${placeholders})`,
      [user.id, ...itemIds]
    );

    const likedIds = Array.isArray(likes) ? likes.map((l) => l.designer_portfolio_item_id) : [];
    return NextResponse.json({ success: true, data: likedIds });
  } catch (error) {
    console.error("GET design-likes error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
