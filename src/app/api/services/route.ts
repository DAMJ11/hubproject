import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/services - List all services (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");

    let sql = `
      SELECT s.*, sc.name as category_name, sc.icon as category_icon
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = TRUE
    `;
    const params: (string | number)[] = [];

    if (categoryId) {
      sql += " AND s.category_id = ?";
      params.push(Number(categoryId));
    }

    if (search) {
      sql += " AND (s.name LIKE ? OR s.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY sc.display_order, s.name";

    const services = await query(sql, params);

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener servicios" },
      { status: 500 }
    );
  }
}
