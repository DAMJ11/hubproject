import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

function isAdmin(role: string) {
  return role === "admin" || role === "super_admin";
}

// GET /api/admin/companies/[id] — full company detail + owner + stats
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = Number(id);
    if (!companyId || Number.isNaN(companyId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const company = await queryOne<{
      id: number;
      name: string;
      slug: string;
      type: string;
      legal_id: string | null;
      description: string | null;
      logo_url: string | null;
      cover_image_url: string | null;
      website: string | null;
      instagram_handle: string | null;
      brand_categories: string | null;
      brand_tagline: string | null;
      ships_worldwide: boolean;
      phone: string | null;
      email: string | null;
      address_line1: string | null;
      city: string | null;
      state: string | null;
      country: string;
      employee_count: string | null;
      founded_year: number | null;
      is_verified: boolean;
      is_active: boolean;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, name, slug, type, legal_id, description, logo_url, cover_image_url,
              website, instagram_handle, brand_categories, brand_tagline, ships_worldwide,
              phone, email, address_line1, city, state, country, employee_count, founded_year,
              is_verified, is_active, verified_at, created_at, updated_at
       FROM companies WHERE id = ?`,
      [companyId]
    );

    if (!company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    // Get owner (user with this company_id)
    const owner = await queryOne<{
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>(
      `SELECT id, first_name, last_name, email, role, is_active, created_at
       FROM users WHERE company_id = ? LIMIT 1`,
      [companyId]
    );

    // Get stats
    const [rfqCount, proposalCount, contractCount] = await Promise.all([
      queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM rfq_projects WHERE company_id = ?`,
        [companyId]
      ),
      queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM proposals WHERE company_id = ?`,
        [companyId]
      ),
      queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM contracts WHERE brand_company_id = ? OR manufacturer_company_id = ?`,
        [companyId, companyId]
      ),
    ]);

    return NextResponse.json({
      company,
      owner: owner ?? null,
      stats: {
        rfqProjects: rfqCount?.count ?? 0,
        proposals: proposalCount?.count ?? 0,
        contracts: contractCount?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Error fetching company detail:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PUT /api/admin/companies/[id] — edit company data
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = Number(id);
    if (!companyId || Number.isNaN(companyId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM companies WHERE id = ?",
      [companyId]
    );
    if (!existing) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const body = await request.json();

    // Whitelist of editable fields
    const ALLOWED_FIELDS = [
      "name", "description", "phone", "email", "website", "instagram_handle",
      "address_line1", "city", "state", "country", "employee_count",
      "founded_year", "brand_categories", "brand_tagline", "ships_worldwide",
      "legal_id",
    ] as const;

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        updates.push(`${field} = ?`);
        values.push(body[field] ?? null);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    values.push(companyId);
    await query(
      `UPDATE companies SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true, message: "Empresa actualizada" });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/admin/companies/[id] — soft delete (deactivate)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = Number(id);
    if (!companyId || Number.isNaN(companyId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM companies WHERE id = ?",
      [companyId]
    );
    if (!existing) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    // Soft delete: deactivate company and its owner
    await query(
      "UPDATE companies SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [companyId]
    );
    await query(
      "UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?",
      [companyId]
    );

    return NextResponse.json({ success: true, message: "Empresa eliminada" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
