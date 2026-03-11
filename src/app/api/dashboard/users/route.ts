import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const users = await query<Array<{
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      role: string;
      is_active: boolean;
      created_at: string;
      company_name: string | null;
      total_bookings: number;
    }>>(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role,
              u.is_active, u.created_at, c.name as company_name,
              0 as total_bookings
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const userId = Number(body?.userId);
    const action = String(body?.action ?? "");

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId inválido" }, { status: 400 });
    }

    if (!["activate", "deactivate", "grant_admin"].includes(action)) {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "No puedes modificar tu propio usuario" }, { status: 400 });
    }

    const target = await query<Array<{ id: number; role: string }>>(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!target.length) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    // Permitir activar/desactivar/grant_admin para cualquier usuario excepto el propio
    if (action === "grant_admin") {
      if (target[0].role === "admin") {
        return NextResponse.json({ error: "Ya es admin" }, { status: 400 });
      }
      await query(
        "UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [userId]
      );
      return NextResponse.json({ success: true, message: "Permisos de admin otorgados" });
    }

    // Activar/desactivar admins y otros usuarios
    const nextActive = action === "activate";
    await query(
      "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [nextActive, userId]
    );

    return NextResponse.json({
      success: true,
      message: nextActive ? "Usuario activado" : "Usuario desactivado",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = Number(url.searchParams.get("userId"));

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId inválido" }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });
    }

    const target = await query<Array<{ id: number; role: string }>>(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!target.length) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (target[0].role === "admin") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar usuarios no admin" },
        { status: 400 }
      );
    }

    await query("DELETE FROM users WHERE id = ?", [userId]);
    return NextResponse.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (typeof error === "object" && error !== null && "code" in error) {
      const dbError = error as { code?: string };
      if (dbError.code === "ER_ROW_IS_REFERENCED_2") {
        return NextResponse.json(
          { error: "No se puede eliminar el usuario porque tiene registros relacionados. Puedes desactivarlo." },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
