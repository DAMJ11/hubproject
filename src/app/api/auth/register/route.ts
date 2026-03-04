import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import type { User, UserCreateInput, AuthResponse } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const body: UserCreateInput = await request.json();
    const { email, password, firstName, lastName, termsAccepted } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "You must accept the terms and conditions",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await queryOne<User>(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const result = await query<{ insertId: number }>(
      `INSERT INTO users (email, password, first_name, last_name, role, terms_accepted, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, NOW(), NOW())`,
      [email.toLowerCase(), hashedPassword, firstName, lastName, termsAccepted]
    );

    const insertId = (result as unknown as { insertId: number }).insertId;

    // Generate JWT token
    const token = generateToken({
      id: insertId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: "user",
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: insertId,
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: "user",
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "An error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
