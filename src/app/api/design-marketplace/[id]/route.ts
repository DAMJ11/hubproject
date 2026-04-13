import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/design-marketplace/[id] — single portfolio item detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const item = await queryOne<{
      id: number;
      title: string;
      description: string | null;
      category: string;
      season: string | null;
      year: number | null;
      image_url: string | null;
      tags: string | null;
      views_count: number;
      likes_count: number;
      created_at: string;
      designer_profile_id: number;
      designer_name: string;
      designer_slug: string;
      designer_avatar: string | null;
      designer_bio: string | null;
      designer_verified: boolean;
      designer_specialties: string | null;
      location_city: string | null;
      location_country: string | null;
    }>(
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
        dp.bio as designer_bio,
        dp.is_verified as designer_verified,
        dp.specialties as designer_specialties,
        dp.location_city,
        dp.location_country
      FROM designer_portfolio_items dpi
      JOIN designer_profiles dp ON dp.id = dpi.designer_profile_id
      WHERE dpi.id = ? AND dpi.is_public = TRUE`,
      [itemId]
    );

    if (!item) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    // Increment view count
    await query(`UPDATE designer_portfolio_items SET views_count = views_count + 1 WHERE id = ?`, [itemId]);

    // Get more items from same designer (up to 6)
    const relatedItems = await query<unknown[]>(
      `SELECT id, title, image_url, category, likes_count
       FROM designer_portfolio_items
       WHERE designer_profile_id = ? AND id != ? AND is_public = TRUE
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 6`,
      [item.designer_profile_id, itemId]
    );

    return NextResponse.json({
      success: true,
      data: { ...item, views_count: (item.views_count as number) + 1 },
      relatedItems,
    });
  } catch (error) {
    console.error("GET design-marketplace/[id] error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
