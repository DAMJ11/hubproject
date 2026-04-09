import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

// PATCH /api/admin/companies/[id]/status — toggle is_active
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = Number(id);
    if (!companyId || Number.isNaN(companyId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const isActive = Boolean(body?.is_active);

    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM companies WHERE id = ?",
      [companyId]
    );
    if (!existing) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    await query(
      "UPDATE companies SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [isActive, companyId]
    );

    // Also toggle the owner user
    await query(
      "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?",
      [isActive, companyId]
    );

    return NextResponse.json({
      success: true,
      message: isActive ? "Empresa activada" : "Empresa bloqueada",
    });
  } catch (error) {
    console.error("Error updating company status:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
