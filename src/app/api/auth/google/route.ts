import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

function getGoogleClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("GOOGLE_CLIENT_ID is not set");
  return id;
}

function getAppOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get("locale") ?? "es";
  const role = searchParams.get("role") ?? "brand";
  const origin = getAppOrigin(request);

  // CSRF state token
  const state = randomBytes(32).toString("hex");

  const callbackUrl = `${origin}/api/auth/google/callback`;

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", getGoogleClientId());
  googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(googleAuthUrl.toString());

  // Store state + meta in cookies (httpOnly, short-lived)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  };
  response.cookies.set("oauth_state", state, cookieOptions);
  response.cookies.set("oauth_locale", locale, cookieOptions);
  response.cookies.set("oauth_role", role, cookieOptions);
  response.cookies.set("oauth_callback_origin", origin, cookieOptions);

  return response;
}
