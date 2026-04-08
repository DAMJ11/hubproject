import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getRequestLocale, getServerText } from "@/lib/server-text";

export async function POST(request: NextRequest) {
  let t = (keyPath: string, _values?: Record<string, string>, fallback?: string) => fallback ?? keyPath;
  try {
    t = await getServerText(request);
    const ip = getClientIp(request);
    const rl = checkRateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: t("AuthApi.forgotPassword.rateLimit", { seconds: String(rl.retryAfterSeconds) }),
        },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    const locale = getRequestLocale(request);

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: t("AuthApi.forgotPassword.emailRequired") }, { status: 400 });
    }

    // Always return success to avoid email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: t("AuthApi.forgotPassword.success"),
    });

    const user = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (!user) return successResponse;

    // Invalidate previous tokens
    await query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
      [user.id]
    );

    // Generate new token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " "); // 1 hour

    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    await sendPasswordResetEmail(email.toLowerCase(), token, locale, { appUrl: request.nextUrl.origin });

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: t("AuthApi.forgotPassword.serverError") },
      { status: 500 }
    );
  }
}
