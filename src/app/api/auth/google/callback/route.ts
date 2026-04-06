import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { randomBytes } from "crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string;       // google_id
  email: string;
  email_verified: boolean;
  given_name: string;
  family_name: string;
  picture?: string;
  name?: string;
}

interface DbUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: number | null;
}

type DbUserRow = RowDataPacket & DbUser;

async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google token exchange failed: ${errText}`);
  }

  return res.json();
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json();
}

function buildRedirectUrl(origin: string, locale: string, path: string): string {
  return `${origin}/${locale}${path}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const cookieState = request.cookies.get("oauth_state")?.value;
  const locale = request.cookies.get("oauth_locale")?.value ?? "es";
  const role = request.cookies.get("oauth_role")?.value ?? "brand";
  const callbackOrigin = request.cookies.get("oauth_callback_origin")?.value ?? request.nextUrl.origin;

  const loginUrl = buildRedirectUrl(callbackOrigin, locale, "/login?error=google_failed");

  // Clear OAuth cookies regardless of outcome
  const clearCookies = (res: NextResponse) => {
    res.cookies.delete("oauth_state");
    res.cookies.delete("oauth_locale");
    res.cookies.delete("oauth_role");
    res.cookies.delete("oauth_callback_origin");
    return res;
  };

  // User cancelled or Google returned error
  if (errorParam) {
    return clearCookies(NextResponse.redirect(loginUrl));
  }

  // CSRF check
  if (!code || !stateParam || !cookieState || stateParam !== cookieState) {
    return clearCookies(NextResponse.redirect(loginUrl));
  }

  try {
    const redirectUri = `${callbackOrigin}/api/auth/google/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email || !googleUser.email_verified) {
      return clearCookies(NextResponse.redirect(loginUrl));
    }

    const connection = await pool.getConnection();
    let user: DbUser | null = null;

    try {
      // 1. Look up by google_id
      const [byGoogleId] = await connection.execute<DbUserRow[]>(
        `SELECT id, email, first_name, last_name, role, company_id
         FROM users WHERE google_id = ? AND is_active = TRUE LIMIT 1`,
        [googleUser.sub]
      );
      if (byGoogleId.length > 0) {
        user = byGoogleId[0];
      }

      // 2. Look up by email (existing account — link it)
      if (!user) {
        const [byEmail] = await connection.execute<DbUserRow[]>(
          `SELECT id, email, first_name, last_name, role, company_id
           FROM users WHERE email = ? AND is_active = TRUE LIMIT 1`,
          [googleUser.email.toLowerCase()]
        );
        if (byEmail.length > 0) {
          user = byEmail[0];
          // Link google_id to existing account
          await connection.execute(
            `UPDATE users SET google_id = ?, auth_provider = 'google', email_verified = TRUE,
             email_verified_at = NOW(), updated_at = NOW()
             WHERE id = ?`,
            [googleUser.sub, user.id]
          );
        }
      }

      // 3. Auto-register new user
      if (!user) {
        await connection.beginTransaction();
        try {
          const firstName = googleUser.given_name || googleUser.name?.split(" ")[0] || "Usuario";
          const lastName = googleUser.family_name || googleUser.name?.split(" ").slice(1).join(" ") || "";
          const companyName = `${firstName} ${lastName}`.trim() || googleUser.email.split("@")[0];
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const validRole = role === "manufacturer" ? "manufacturer" : "brand";

          // Create company
          const [companyResult] = await connection.execute<ResultSetHeader>(
            `INSERT INTO companies (name, slug, type, email, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`,
            [companyName, `${slug}-${Date.now()}`, validRole, googleUser.email.toLowerCase()]
          );
          const companyId = companyResult.insertId;

          // Create user (no password, google only — store random hash so NOT NULL is satisfied)
          const randomPass = await hashPassword(randomBytes(32).toString("hex"));
          const [userResult] = await connection.execute<ResultSetHeader>(
            `INSERT INTO users
             (email, password, first_name, last_name, role, company_id, terms_accepted,
              email_verified, email_verified_at, google_id, auth_provider, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE, NOW(), ?, 'google', TRUE, NOW(), NOW())`,
            [
              googleUser.email.toLowerCase(),
              randomPass,
              firstName,
              lastName,
              validRole,
              companyId,
              googleUser.sub,
            ]
          );

          const insertId = userResult.insertId;
          await connection.commit();

          user = {
            id: insertId,
            email: googleUser.email.toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            role: validRole,
            company_id: companyId,
          };
        } catch (txErr) {
          await connection.rollback();
          throw txErr;
        }
      }
    } finally {
      connection.release();
    }

    // Generate JWT and set cookie using existing auth system
    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role as import("@/types/user").UserRole,
      companyId: user.company_id,
    });

    await setAuthCookie(jwtToken);

    const dashboardUrl = buildRedirectUrl(callbackOrigin, locale, "/dashboard");
    const successResponse = NextResponse.redirect(dashboardUrl);
    return clearCookies(successResponse);
  } catch (err) {
    console.error("[Google OAuth callback error]", err);
    return clearCookies(NextResponse.redirect(loginUrl));
  }
}
