import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/designer/profile — get current designer's profile
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const profile = await queryOne(
      `SELECT dp.*, u.email, u.first_name, u.last_name, u.avatar_url as user_avatar
       FROM designer_profiles dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.user_id = ?`,
      [user.id]
    );

    if (!profile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET designer profile error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/designer/profile — update designer profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      displayName, bio, specialties, yearsExperience, portfolioUrl,
      instagramHandle, behanceUrl, dribbbleUrl, linkedinUrl, websiteUrl,
      locationCity, locationCountry, availabilityStatus,
      hourlyRateMin, hourlyRateMax, currency, isFreelance,
      avatarUrl, coverImageUrl,
    } = body;

    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Display name is required (min 2 chars)" }, { status: 400 });
    }

    // Validate availability_status
    const validStatuses = ["available", "busy", "unavailable"];
    if (availabilityStatus && !validStatuses.includes(availabilityStatus)) {
      return NextResponse.json({ success: false, message: "Invalid availability status" }, { status: 400 });
    }

    // Validate rates
    if (hourlyRateMin !== undefined && hourlyRateMin !== null && Number(hourlyRateMin) < 0) {
      return NextResponse.json({ success: false, message: "Rate cannot be negative" }, { status: 400 });
    }

    // Validate base64 image sizes (5MB max)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, message: "Avatar image too large (max 5MB)" }, { status: 400 });
    }
    if (coverImageUrl && typeof coverImageUrl === "string" && coverImageUrl.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, message: "Cover image too large (max 5MB)" }, { status: 400 });
    }

    // Generate slug from displayName
    const slug = displayName.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);

    // Ensure slug uniqueness
    const existingSlug = await queryOne<{ id: number }>(
      `SELECT id FROM designer_profiles WHERE slug = ? AND user_id != ?`,
      [slug, user.id]
    );
    const finalSlug = existingSlug ? `${slug}-${user.id}` : slug;

    // Serialize specialties array to JSON string
    const specialtiesStr = Array.isArray(specialties) ? JSON.stringify(specialties) : specialties || null;

    await query(
      `UPDATE designer_profiles SET
        display_name = ?, slug = ?, bio = ?, specialties = ?, years_experience = ?,
        portfolio_url = ?, instagram_handle = ?, behance_url = ?, dribbble_url = ?,
        linkedin_url = ?, website_url = ?, location_city = ?, location_country = ?,
        availability_status = ?, hourly_rate_min = ?, hourly_rate_max = ?, currency = ?,
        is_freelance = ?, avatar_url = ?, cover_image_url = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [
        displayName.trim(), finalSlug, bio || null, specialtiesStr, yearsExperience || null,
        portfolioUrl || null, instagramHandle || null, behanceUrl || null, dribbbleUrl || null,
        linkedinUrl || null, websiteUrl || null, locationCity || null, locationCountry || "Colombia",
        availabilityStatus || "available", hourlyRateMin || null, hourlyRateMax || null, currency || "USD",
        isFreelance !== undefined ? isFreelance : true, avatarUrl || null, coverImageUrl || null,
        user.id,
      ]
    );

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("PUT designer profile error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
