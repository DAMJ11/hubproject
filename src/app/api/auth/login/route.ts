import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { comparePassword, generateToken, setAuthCookie } from "@/lib/auth";
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

    // Find user by email
    const user = await queryOne<User>(
      "SELECT id, email, password, first_name, last_name, role FROM users WHERE email = ?",
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
      role: user.role || "user",
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || "user",
        },
        token,
      },
      { status: 200 }
    );
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
