import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { User, AuthResponse } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 intentos por IP cada 15 minutos
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: `Demasiados intentos. Intenta en ${rl.retryAfterSeconds}s` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    // Find user by email (include company info)
    const user = await queryOne<User & { company_name?: string }>(
      `SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.role, u.company_id,
              c.name as company_name
       FROM users u LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = ?`,
      [email.toLowerCase()]
    );

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email or password",
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
          message: "Invalid email or password",
        },
        { status: 401 }
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
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || "brand",
          companyId: user.company_id ?? null,
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
        message: "An error occurred during login. Please try again.",
      },
      { status: 500 }
    );
  }
}
