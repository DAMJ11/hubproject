import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import type { User, UserLoginInput, AuthResponse } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const body: UserLoginInput = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

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
