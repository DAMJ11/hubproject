import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/designers/[slug] — public designer profile
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
    }

    const profile = await queryOne(
      `SELECT dp.id, dp.display_name, dp.slug, dp.bio, dp.specialties,
              dp.years_experience, dp.portfolio_url, dp.instagram_handle,
              dp.behance_url, dp.dribbble_url, dp.linkedin_url, dp.website_url,
              dp.location_city, dp.location_country, dp.availability_status,
              dp.hourly_rate_min, dp.hourly_rate_max, dp.currency,
              dp.is_verified, dp.rating_avg, dp.total_reviews,
              dp.projects_completed, dp.is_freelance, dp.avatar_url, dp.cover_image_url
       FROM designer_profiles dp
       WHERE dp.slug = ?`,
      [slug]
    );

    if (!profile) {
      return NextResponse.json({ success: false, message: "Designer not found" }, { status: 404 });
    }

    const portfolioItems = await query(
      `SELECT id, title, description, category, season, year, image_url, tags,
              views_count, likes_count, created_at
       FROM designer_portfolio_items
       WHERE designer_profile_id = ? AND is_public = TRUE
       ORDER BY sort_order ASC, created_at DESC`,
      [(profile as { id: number }).id]
    );

    return NextResponse.json({
      success: true,
      data: { ...profile, portfolio_items: portfolioItems },
    });
  } catch (error) {
    console.error("GET designer by slug error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
