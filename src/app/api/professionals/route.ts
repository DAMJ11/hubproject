import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/professionals - List professionals with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get("verified");
    const search = searchParams.get("search");
    const serviceId = searchParams.get("service");

    let sql = `
      SELECT p.*,
        u.first_name, u.last_name, u.email,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT b.id) as completed_jobs
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN bookings b ON b.professional_id = p.id AND b.status = 'completed'
      LEFT JOIN reviews r ON r.professional_id = p.id
      WHERE p.is_active = TRUE
    `;
    const params: (string | number)[] = [];

    if (verified === "true") {
      sql += " AND p.is_verified = TRUE";
    }

    if (search) {
      sql += " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR p.bio LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " GROUP BY p.id, u.first_name, u.last_name, u.email";
    sql += " ORDER BY avg_rating DESC";

    const professionals = await query(sql, params);

    // If filtering by service, we need an additional join
    if (serviceId) {
      const filteredSql = `
        SELECT p.*,
          u.first_name, u.last_name, u.email,
          AVG(r.rating) as avg_rating,
          COUNT(DISTINCT r.id) as total_reviews,
          COUNT(DISTINCT b.id) as completed_jobs
        FROM professionals p
        JOIN users u ON p.user_id = u.id
        JOIN professional_services ps ON ps.professional_id = p.id
        LEFT JOIN bookings b ON b.professional_id = p.id AND b.status = 'completed'
        LEFT JOIN reviews r ON r.professional_id = p.id
        WHERE p.is_active = TRUE AND ps.service_id = ?
        GROUP BY p.id, u.first_name, u.last_name, u.email
        ORDER BY avg_rating DESC
      `;
      const filteredProfessionals = await query(filteredSql, [Number(serviceId)]);
      return NextResponse.json({ success: true, professionals: filteredProfessionals });
    }

    return NextResponse.json({ success: true, professionals });
  } catch (error) {
    console.error("Error fetching professionals:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener profesionales" },
      { status: 500 }
    );
  }
}
