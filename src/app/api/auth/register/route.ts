import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import type { User, UserCreateInput, AuthResponse } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const body: UserCreateInput = await request.json();
    const { email, password, firstName, lastName, role, companyName, termsAccepted } = body;

    // Validate role
    const validRoles = ["brand", "manufacturer"] as const;
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Role must be 'brand' or 'manufacturer'" },
        { status: 400 }
      );
    }

    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Company name is required (min 2 characters)" },
        { status: 400 }
      );
    }

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

    // Use transaction: create company + user atomically
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create company
      const slug = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const [companyResult] = await connection.execute(
        `INSERT INTO companies (name, slug, type, email, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [companyName.trim(), slug + "-" + Date.now(), role, email.toLowerCase()]
      );
      const companyId = (companyResult as { insertId: number }).insertId;

      // Create user linked to company
      const [userResult] = await connection.execute(
        `INSERT INTO users (email, password, first_name, last_name, role, company_id, terms_accepted, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [email.toLowerCase(), hashedPassword, firstName, lastName, role, companyId, termsAccepted]
      );
      const insertId = (userResult as { insertId: number }).insertId;

      await connection.commit();

      // Generate JWT token
      const token = generateToken({
        id: insertId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        role,
        companyId,
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
            role,
            companyId,
            companyName: companyName.trim(),
          },
          token,
        },
        { status: 201 }
      );
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
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
