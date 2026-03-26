import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// GET /api/companies/me - Obtener la empresa del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated or no company" },
        { status: 401 }
      );
    }

    const company = await queryOne(
      `SELECT id, name, slug, type, legal_id, description, logo_url, website,
              phone, email, address_line1, city, state, country, latitude, longitude,
              employee_count, founded_year, is_verified, created_at
       FROM companies
       WHERE id = ? AND is_active = TRUE`,
      [user.companyId]
    );

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("GET /api/companies/me error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
