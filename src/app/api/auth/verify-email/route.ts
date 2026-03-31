import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/es/login?verify=invalid", request.url));
    }

    const user = await queryOne<{ id: number; email_verified: boolean; email_verification_expires: Date }>(
      "SELECT id, email_verified, email_verification_expires FROM users WHERE email_verification_token = ?",
      [token]
    );

    if (!user) {
      return NextResponse.redirect(new URL("/es/login?verify=invalid", request.url));
    }

    if (user.email_verified) {
      return NextResponse.redirect(new URL("/es/login?verify=already", request.url));
    }

    if (new Date() > new Date(user.email_verification_expires)) {
      return NextResponse.redirect(new URL("/es/login?verify=expired", request.url));
    }

    await query(
      `UPDATE users SET email_verified = TRUE, email_verified_at = NOW(),
       email_verification_token = NULL, email_verification_expires = NULL
       WHERE id = ?`,
      [user.id]
    );

    return NextResponse.redirect(new URL("/es/login?verify=success", request.url));
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(new URL("/es/login?verify=error", request.url));
  }
}
