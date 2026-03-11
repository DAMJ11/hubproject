import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/companies - Listar empresas (filtrable por tipo)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    let sql = `SELECT id, name, slug, type, description, logo_url, city, state, country,
                      latitude, longitude, is_verified, employee_count, founded_year, created_at
               FROM companies WHERE is_active = TRUE`;
    const params: (string | number)[] = [];

    if (type === "brand" || type === "manufacturer") {
      sql += ` AND type = ?`;
      params.push(type);
    }

    const safeLimit = Math.trunc(limit);
    const safeOffset = Math.trunc(offset);
    sql += ` ORDER BY is_verified DESC, created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const companies = await query<Record<string, unknown>[]>(sql, params);

    return NextResponse.json({ success: true, data: companies, page, limit });
  } catch (error) {
    console.error("GET /api/companies error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/companies - Actualizar mi empresa
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json({ success: false, message: "Not authenticated or no company" }, { status: 401 });
    }

    const body = await request.json();
    const allowed = ["name", "description", "phone", "website", "address_line1", "city", "state", "country", "latitude", "longitude", "employee_count", "founded_year", "legal_id"];
    const sets: string[] = [];
    const params: (string | number | null)[] = [];

    for (const key of allowed) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (body[camelKey] !== undefined) {
        sets.push(`${key} = ?`);
        params.push(body[camelKey]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 });
    }

    params.push(user.companyId);
    await query(`UPDATE companies SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`, params);

    const updated = await queryOne(`SELECT * FROM companies WHERE id = ?`, [user.companyId]);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/companies error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
