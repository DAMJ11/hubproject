import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

// PATCH /api/admin/companies/[id]/verify — toggle is_verified
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
    const isVerified = Boolean(body?.is_verified);

    const existing = await queryOne<{ id: number; is_verified: boolean }>(
      "SELECT id, is_verified FROM companies WHERE id = ?",
      [companyId]
    );
    if (!existing) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    await query(
      `UPDATE companies SET is_verified = ?, verified_at = ${isVerified ? "CURRENT_TIMESTAMP" : "NULL"}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [isVerified, companyId]
    );

    return NextResponse.json({
      success: true,
      message: isVerified ? "Empresa verificada" : "Verificación removida",
    });
  } catch (error) {
    console.error("Error updating company verification:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
