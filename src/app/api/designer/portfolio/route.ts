import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

const VALID_CATEGORIES = ["collections", "tech_packs", "patterns", "illustration", "branding", "consulting"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB base64

// GET /api/designer/portfolio — list portfolio items for current designer (or by designerProfileId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const designerProfileId = searchParams.get("designerProfileId");
    const category = searchParams.get("category");
    const isPublicOnly = searchParams.get("public") === "true";

    let whereClause = "";
    const params: (string | number)[] = [];

    if (designerProfileId) {
      // Public view of another designer
      whereClause = "WHERE dpi.designer_profile_id = ? AND dpi.is_public = TRUE";
      params.push(Number(designerProfileId));
    } else {
      // Current user's own portfolio
      const user = await getSessionUser(request);
      if (!user) {
        return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
      }

      const profile = await queryOne<{ id: number }>(
        "SELECT id FROM designer_profiles WHERE user_id = ?",
        [user.id]
      );
      if (!profile) {
        return NextResponse.json({ success: true, data: [] });
      }

      whereClause = `WHERE dpi.designer_profile_id = ?${isPublicOnly ? " AND dpi.is_public = TRUE" : ""}`;
      params.push(profile.id);
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      whereClause += " AND dpi.category = ?";
      params.push(category);
    }

    const items = await query(
      `SELECT dpi.id, dpi.designer_profile_id, dpi.title, dpi.description, dpi.category,
              dpi.season, dpi.year, dpi.image_url, dpi.tags, dpi.is_public,
              dpi.views_count, dpi.likes_count, dpi.sort_order, dpi.created_at
       FROM designer_portfolio_items dpi
       ${whereClause}
       ORDER BY dpi.sort_order ASC, dpi.created_at DESC`,
      params
    );

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET portfolio error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/designer/portfolio — create portfolio item
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const profile = await queryOne<{ id: number }>(
      "SELECT id FROM designer_profiles WHERE user_id = ?",
      [user.id]
    );
    if (!profile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, category, season, year, imageUrl, tags, isPublic } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Title is required (min 2 chars)" }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
    }
    if (imageUrl && typeof imageUrl === "string" && imageUrl.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, message: "Image too large (max 5MB)" }, { status: 400 });
    }

    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : tags || null;

    // Get next sort_order
    const maxOrder = await queryOne<{ max_order: number }>(
      "SELECT COALESCE(MAX(sort_order), 0) as max_order FROM designer_portfolio_items WHERE designer_profile_id = ?",
      [profile.id]
    );

    const result = await query(
      `INSERT INTO designer_portfolio_items
        (designer_profile_id, title, description, category, season, year, image_url, tags, is_public, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id, title.trim(), description || null, category, season || null,
        year || null, imageUrl || null, tagsStr, isPublic !== false, (maxOrder?.max_order ?? 0) + 1,
      ]
    );

    return NextResponse.json({ success: true, message: "Portfolio item created", data: { id: (result as { insertId?: number }).insertId } }, { status: 201 });
  } catch (error) {
    console.error("POST portfolio error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/designer/portfolio — update portfolio item
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, category, season, year, imageUrl, tags, isPublic, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Item id is required" }, { status: 400 });
    }

    // Verify ownership
    const item = await queryOne<{ id: number }>(
      `SELECT dpi.id FROM designer_portfolio_items dpi
       JOIN designer_profiles dp ON dpi.designer_profile_id = dp.id
       WHERE dpi.id = ? AND dp.user_id = ?`,
      [id, user.id]
    );
    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found or unauthorized" }, { status: 404 });
    }

    if (title && title.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Title too short (min 2 chars)" }, { status: 400 });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, message: `Invalid category` }, { status: 400 });
    }
    if (imageUrl && typeof imageUrl === "string" && imageUrl.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, message: "Image too large (max 5MB)" }, { status: 400 });
    }

    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : tags;

    await query(
      `UPDATE designer_portfolio_items SET
        title = COALESCE(?, title), description = COALESCE(?, description),
        category = COALESCE(?, category), season = COALESCE(?, season),
        year = COALESCE(?, year), image_url = COALESCE(?, image_url),
        tags = COALESCE(?, tags), is_public = COALESCE(?, is_public),
        sort_order = COALESCE(?, sort_order), updated_at = NOW()
       WHERE id = ?`,
      [
        title?.trim(), description, category, season, year,
        imageUrl, tagsStr, isPublic, sortOrder, id,
      ]
    );

    return NextResponse.json({ success: true, message: "Portfolio item updated" });
  } catch (error) {
    console.error("PUT portfolio error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/designer/portfolio?id=X
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, message: "Item id is required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const deleted = await query(
      `DELETE dpi FROM designer_portfolio_items dpi
       JOIN designer_profiles dp ON dpi.designer_profile_id = dp.id
       WHERE dpi.id = ? AND dp.user_id = ?`,
      [id, user.id]
    );

    return NextResponse.json({ success: true, message: "Portfolio item deleted" });
  } catch (error) {
    console.error("DELETE portfolio error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
