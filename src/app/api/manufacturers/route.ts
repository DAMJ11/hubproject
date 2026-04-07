import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

interface ManufacturerRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  country: string;
  is_verified: boolean;
  employee_count: string | null;
  founded_year: number | null;
  certifications_count: number | null;
  verified_certifications_count: number | null;
  awarded_projects_count: number | null;
  capabilities_raw: string | null;
  min_moq: number | null;
  has_design: number;
  has_production: number;
  ships_worldwide: number;
}

// GET /api/manufacturers
// Filtros: q, location, categoryId, moqTier, shipping, page, limit
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const location = (searchParams.get("location") || "").trim();
    const categoryId = Number(searchParams.get("categoryId") || "0");
    const moqTier = Number(searchParams.get("moqTier") || "0");
    const shipping = (searchParams.get("shipping") || "").trim();

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit")) || 12));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["c.is_active = TRUE", "c.type = 'manufacturer'"];
    const params: Array<string | number> = [];

    if (q) {
      whereClauses.push("(c.name LIKE ? OR c.description LIKE ? OR c.city LIKE ? OR c.state LIKE ?)");
      const searchPattern = `%${q}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (location) {
      whereClauses.push("(c.city LIKE ? OR c.state LIKE ? OR c.country LIKE ?)");
      const locationPattern = `%${location}%`;
      params.push(locationPattern, locationPattern, locationPattern);
    }

    if (categoryId && !Number.isNaN(categoryId)) {
      whereClauses.push(
        `EXISTS (
          SELECT 1
          FROM manufacturer_capabilities mc2
          WHERE mc2.company_id = c.id
            AND mc2.category_id = ?
            AND mc2.is_active = TRUE
        )`
      );
      params.push(categoryId);
    }

    if ((moqTier === 1 || moqTier === 10 || moqTier === 50)) {
      whereClauses.push("caps.min_moq IS NOT NULL AND caps.min_moq >= ?");
      params.push(moqTier);
    }

    if (shipping === "international") {
      whereClauses.push("c.ships_worldwide = TRUE");
    }

    const whereSql = whereClauses.join(" AND ");

    const data = await query<ManufacturerRow[]>(
      `SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.logo_url,
        c.city,
        c.state,
        c.country,
        c.is_verified,
        c.employee_count,
        c.founded_year,
        caps.min_moq,
        c.ships_worldwide,
        COALESCE(cert.certifications_count, 0) AS certifications_count,
        COALESCE(cert.verified_certifications_count, 0) AS verified_certifications_count,
        COALESCE(awards.awarded_projects_count, 0) AS awarded_projects_count,
        caps.capabilities_raw
      FROM companies c
      LEFT JOIN (
        SELECT
          mc.company_id,
          GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR '||') AS capabilities_raw,
          MIN(mc.min_order_qty) AS min_moq,
          MAX(CASE WHEN sc.slug IN ('design', 'tech-pack', 'branding') THEN 1 ELSE 0 END) AS has_design,
          MAX(CASE WHEN sc.slug IN ('production', 'sampling', 'sourcing') THEN 1 ELSE 0 END) AS has_production
        FROM manufacturer_capabilities mc
        JOIN service_categories sc ON sc.id = mc.category_id
        WHERE mc.is_active = TRUE
        GROUP BY mc.company_id
      ) caps ON caps.company_id = c.id
      LEFT JOIN (
        SELECT
          mcert.company_id,
          COUNT(*) AS certifications_count,
          SUM(CASE WHEN mcert.is_verified = TRUE THEN 1 ELSE 0 END) AS verified_certifications_count
        FROM manufacturer_certifications mcert
        WHERE (mcert.expires_at IS NULL OR mcert.expires_at >= CURDATE())
        GROUP BY mcert.company_id
      ) cert ON cert.company_id = c.id
      LEFT JOIN (
        SELECT
          p.manufacturer_company_id,
          COUNT(*) AS awarded_projects_count
        FROM proposals p
        WHERE p.status = 'accepted'
        GROUP BY p.manufacturer_company_id
      ) awards ON awards.manufacturer_company_id = c.id
      WHERE ${whereSql}
      ORDER BY c.is_verified DESC, awards.awarded_projects_count DESC, c.created_at DESC
      LIMIT ${Math.trunc(limit)} OFFSET ${Math.trunc(offset)}`,
      params
    );

    const totalRows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total
       FROM companies c
       WHERE ${whereSql}`,
      params
    );

    const total = Number(totalRows?.[0]?.total ?? 0);

    const manufacturers = data.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logoUrl: row.logo_url,
      city: row.city,
      state: row.state,
      country: row.country,
      isVerified: Boolean(row.is_verified),
      employeeCount: row.employee_count,
      foundedYear: row.founded_year,
      certificationsCount: Number(row.certifications_count ?? 0),
      verifiedCertificationsCount: Number(row.verified_certifications_count ?? 0),
      awardedProjectsCount: Number(row.awarded_projects_count ?? 0),
      capabilities: row.capabilities_raw ? row.capabilities_raw.split("||") : [],
      minMoq: row.min_moq,
      serviceMode: row.has_design && row.has_production ? "design_and_production" : row.has_design ? "design_only" : row.has_production ? "production_only" : "not_defined",
      shipsWorldwide: Boolean(row.ships_worldwide),
    }));

    return NextResponse.json({
      success: true,
      data: manufacturers,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("GET /api/manufacturers error:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
