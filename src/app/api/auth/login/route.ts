import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getServerText } from "@/lib/server-text";
import type { User, AuthResponse } from "@/types/user";

export async function POST(request: NextRequest) {
  let t = (keyPath: string, _values?: Record<string, string>, fallback?: string) => fallback ?? keyPath;
  try {
    t = await getServerText(request);
    // Rate limiting: 5 intentos por IP cada 15 minutos
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: t("AuthApi.login.rateLimit", { seconds: String(rl.retryAfterSeconds) }),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: t("AuthApi.login.invalidForm") },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    // Find user by email (include company info)
    const user = await queryOne<User & { company_name?: string; company_logo_url?: string | null; email_verified: boolean }>(
      `SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.role, u.company_id,
              u.avatar_url, u.email_verified, c.name AS company_name, c.logo_url AS company_logo_url
       FROM users u LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = ?`,
      [email.toLowerCase()]
    );

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: t("AuthApi.login.invalidCredentials"),
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: t("AuthApi.login.invalidCredentials"),
        },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.email_verified) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || "brand",
      companyId: user.company_id ?? null,
    });

    // Set auth cookie (usando NextResponse)
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: t("AuthApi.login.success"),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || "brand",
          companyId: user.company_id ?? null,
          avatarUrl: (user as { avatar_url?: string | null }).avatar_url ?? null,
          companyLogoUrl: (user as { company_logo_url?: string | null }).company_logo_url ?? null,
          companyName: (user as { company_name?: string }).company_name,
        },
        token,
      },
      { status: 200 }
    );
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: t("AuthApi.login.serverError"),
      },
      { status: 500 }
    );
  }
}
