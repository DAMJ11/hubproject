import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`resend-verify:${ip}`, 3, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: `Demasiados intentos. Intenta en ${rl.retryAfterSeconds}s` },
        { status: 429 }
      );
    }

    const { email, locale = "es" } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email requerido" }, { status: 400 });
    }

    const user = await queryOne<{ id: number; email_verified: boolean }>(
      "SELECT id, email_verified FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    // Always return success to avoid enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace de verificación.",
    });

    if (!user || user.email_verified) return successResponse;

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

    await query(
      "UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?",
      [token, expires, user.id]
    );

    await sendVerificationEmail(email.toLowerCase(), token, locale);

    return successResponse;
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
