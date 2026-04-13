import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/design-marketplace — public listing of portfolio items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const offset = (page - 1) * limit;

    const category = searchParams.get("category") || "";
    const season = searchParams.get("season") || "";
    const search = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "recent";
    const designerId = searchParams.get("designerId") || "";

    const conditions: string[] = ["dpi.is_public = TRUE"];
    const params: (string | number)[] = [];

    if (category) {
      conditions.push("dpi.category = ?");
      params.push(category);
    }
    if (season) {
      conditions.push("dpi.season = ?");
      params.push(season);
    }
    if (search) {
      conditions.push("(dpi.title LIKE ? OR dpi.description LIKE ? OR dpi.tags LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (designerId && Number.isFinite(Number(designerId))) {
      conditions.push("dpi.designer_profile_id = ?");
      params.push(Number(designerId));
    }

    const whereClause = conditions.join(" AND ");

    let orderBy = "dpi.created_at DESC";
    if (sort === "popular") orderBy = "dpi.likes_count DESC, dpi.views_count DESC";
    else if (sort === "views") orderBy = "dpi.views_count DESC";
    else if (sort === "likes") orderBy = "dpi.likes_count DESC";

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM designer_portfolio_items dpi WHERE ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    const items = await query<unknown[]>(
      `SELECT 
        dpi.id,
        dpi.title,
        dpi.description,
        dpi.category,
        dpi.season,
        dpi.year,
        dpi.image_url,
        dpi.tags,
        dpi.views_count,
        dpi.likes_count,
        dpi.created_at,
        dp.id as designer_profile_id,
        dp.display_name as designer_name,
        dp.slug as designer_slug,
        dp.avatar_url as designer_avatar,
        dp.is_verified as designer_verified
      FROM designer_portfolio_items dpi
      JOIN designer_profiles dp ON dp.id = dpi.designer_profile_id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET design-marketplace error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
