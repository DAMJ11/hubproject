import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ success: false, message: "Datos inválidos" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    const resetToken = await queryOne<{ id: number; user_id: number; expires_at: Date; used_at: Date | null }>(
      "SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token = ?",
      [token]
    );

    if (!resetToken) {
      return NextResponse.json({ success: false, message: "Token inválido o expirado" }, { status: 400 });
    }

    if (resetToken.used_at) {
      return NextResponse.json({ success: false, message: "Este enlace ya fue utilizado" }, { status: 400 });
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      return NextResponse.json({ success: false, message: "El enlace ha expirado. Solicita uno nuevo." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await query("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [
      hashedPassword,
      resetToken.user_id,
    ]);

    await query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?", [resetToken.id]);

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
