import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { User, AuthResponse } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registros por IP cada hora
    const ip = getClientIp(request);
    const rl = checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: `Demasiados intentos de registro. Intenta en ${rl.retryAfterSeconds}s` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    const { email, password, firstName, lastName, role, companyName, termsAccepted } = parsed.data;

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
