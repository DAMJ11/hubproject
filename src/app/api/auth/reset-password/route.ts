import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { getServerText } from "@/lib/server-text";

export async function POST(request: NextRequest) {
  let t = (keyPath: string, _values?: Record<string, string>, fallback?: string) => fallback ?? keyPath;
  try {
    t = await getServerText(request);
    const { token, password } = await request.json();

    if (!token || !password || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ success: false, message: t("AuthApi.resetPassword.invalidPayload") }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: t("AuthApi.resetPassword.passwordMin") }, { status: 400 });
    }

    const resetToken = await queryOne<{ id: number; user_id: number; expires_at: Date; used_at: Date | null }>(
      "SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token = ?",
      [token]
    );

    if (!resetToken) {
      return NextResponse.json({ success: false, message: t("AuthApi.resetPassword.invalidToken") }, { status: 400 });
    }

    if (resetToken.used_at) {
      return NextResponse.json({ success: false, message: t("AuthApi.resetPassword.alreadyUsed") }, { status: 400 });
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      return NextResponse.json({ success: false, message: t("AuthApi.resetPassword.expired") }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await query("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [
      hashedPassword,
      resetToken.user_id,
    ]);

    await query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?", [resetToken.id]);

    return NextResponse.json({ success: true, message: t("AuthApi.resetPassword.success") });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: t("AuthApi.resetPassword.serverError") },
      { status: 500 }
    );
  }
}
