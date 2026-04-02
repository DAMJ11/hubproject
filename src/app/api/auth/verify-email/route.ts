import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

const SUPPORTED_LOCALES = new Set(["es", "en", "fr"]);

function getLoginRedirectUrl(request: NextRequest, status: string) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = localeParam && SUPPORTED_LOCALES.has(localeParam) ? localeParam : "es";

  return new URL(`/${locale}/login?verify=${status}`, request.url);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(getLoginRedirectUrl(request, "invalid"));
    }

    const user = await queryOne<{ id: number; email_verified: boolean; email_verification_expires: Date }>(
      "SELECT id, email_verified, email_verification_expires FROM users WHERE email_verification_token = ?",
      [token]
    );

    if (!user) {
      return NextResponse.redirect(getLoginRedirectUrl(request, "invalid"));
    }

    if (user.email_verified) {
      return NextResponse.redirect(getLoginRedirectUrl(request, "already"));
    }

    if (new Date() > new Date(user.email_verification_expires)) {
      return NextResponse.redirect(getLoginRedirectUrl(request, "expired"));
    }

    await query(
      `UPDATE users SET email_verified = TRUE, email_verified_at = NOW(),
       email_verification_token = NULL, email_verification_expires = NULL
       WHERE id = ?`,
      [user.id]
    );

    return NextResponse.redirect(getLoginRedirectUrl(request, "success"));
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(getLoginRedirectUrl(request, "error"));
  }
}
