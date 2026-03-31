import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/companies/search?q=texto&type=manufacturer|brand
// Brand busca manufacturers, manufacturer busca brands, admin busca cualquiera
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    // Rate limit: 30 búsquedas por usuario cada 5 minutos
    const rl = checkRateLimit(`search:${user.id}`, 30, 5 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: `Demasiadas búsquedas. Intenta en ${rl.retryAfterSeconds}s` },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const requestedType = searchParams.get("type");

    // Determinar qué tipo de empresa puede buscar
    let targetType: string | null;
    if (hasRole(user, "admin")) {
      targetType = requestedType === "brand" ? "brand" : requestedType === "manufacturer" ? "manufacturer" : null;
    } else if (hasRole(user, "brand")) {
      targetType = "manufacturer"; // brands solo buscan manufacturers
    } else if (hasRole(user, "manufacturer")) {
      targetType = "brand"; // manufacturers solo buscan brands
    } else {
      return NextResponse.json({ success: false, message: "Rol no válido" }, { status: 403 });
    }

    const searchPattern = `%${q}%`;

    const sql = targetType
      ? `SELECT id, name, slug, type, logo_url, city, state, description, is_verified
         FROM companies
         WHERE type = ? AND is_active = TRUE
           AND (name LIKE ? OR city LIKE ? OR description LIKE ?)
         ORDER BY is_verified DESC, name ASC
         LIMIT 20`
      : `SELECT id, name, slug, type, logo_url, city, state, description, is_verified
         FROM companies
         WHERE is_active = TRUE
           AND (name LIKE ? OR city LIKE ? OR description LIKE ?)
         ORDER BY is_verified DESC, name ASC
         LIMIT 20`;

    const queryParams = targetType
      ? [targetType, searchPattern, searchPattern, searchPattern]
      : [searchPattern, searchPattern, searchPattern];

    const companies = await query<Array<{
      id: number;
      name: string;
      slug: string;
      type: string;
      logo_url: string | null;
      city: string | null;
      state: string | null;
      description: string | null;
      is_verified: boolean;
    }>>(
      sql,
      queryParams
    );

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error("Error searching companies:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
