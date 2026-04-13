import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/designers — public directory of verified designers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const country = searchParams.get("country");
    const availability = searchParams.get("availability");
    const search = searchParams.get("q");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const offset = (page - 1) * limit;

    let whereClause = "WHERE dp.availability_status != 'unavailable'";
    const params: (string | number)[] = [];

    if (specialty) {
      whereClause += " AND dp.specialties LIKE ?";
      params.push(`%${specialty}%`);
    }
    if (country) {
      whereClause += " AND dp.location_country = ?";
      params.push(country);
    }
    if (availability && ["available", "busy"].includes(availability)) {
      whereClause += " AND dp.availability_status = ?";
      params.push(availability);
    }
    if (search) {
      whereClause += " AND (dp.display_name LIKE ? OR dp.bio LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM designer_profiles dp ${whereClause}`,
      params
    );

    const designers = await query(
      `SELECT dp.id, dp.display_name, dp.slug, dp.bio, dp.specialties,
              dp.years_experience, dp.location_city, dp.location_country,
              dp.availability_status, dp.hourly_rate_min, dp.hourly_rate_max,
              dp.currency, dp.is_verified, dp.rating_avg, dp.total_reviews,
              dp.projects_completed, dp.is_freelance, dp.avatar_url,
              (SELECT COUNT(*) FROM designer_portfolio_items dpi WHERE dpi.designer_profile_id = dp.id AND dpi.is_public = TRUE) as portfolio_count
       FROM designer_profiles dp
       ${whereClause}
       ORDER BY dp.is_verified DESC, dp.rating_avg DESC, dp.projects_completed DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: designers,
      pagination: {
        page,
        limit,
        total: countResult?.total ?? 0,
        totalPages: Math.ceil((countResult?.total ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("GET designers directory error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
