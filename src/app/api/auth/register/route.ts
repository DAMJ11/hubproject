import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerServerSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
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
    const parsed = registerServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    const { email, password, firstName, lastName, role, companyName, termsAccepted } = parsed.data;

    // Check if user already exists (anti-enumeration: same response as success)
    const existingUser = await queryOne<User>(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: true,
          message: "Account created. Please check your email to verify your account.",
        },
        { status: 201 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " "); // 24h

    // Use transaction: create company + user atomically
    const connection = await pool.getConnection();
    let insertId: number;
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

      // Create user linked to company (email_verified = FALSE by default)
      const [userResult] = await connection.execute(
        `INSERT INTO users (email, password, first_name, last_name, role, company_id, terms_accepted,
         email_verification_token, email_verification_expires, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [email.toLowerCase(), hashedPassword, firstName, lastName, role, companyId, termsAccepted,
         verificationToken, verificationExpires]
      );
      insertId = (userResult as { insertId: number }).insertId;

      // Auto-assign supplier_standard plan for manufacturers
      if (role === "manufacturer") {
        const [planRows] = await connection.execute(
          "SELECT id FROM subscription_plans WHERE slug = 'supplier_standard' AND is_active = TRUE LIMIT 1"
        );
        const plan = (planRows as { id: number }[])[0];
        if (plan) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setDate(periodEnd.getDate() + 30);
          await connection.execute(
            `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
             VALUES (?, ?, 'active', ?, ?, NOW(), NOW())`,
            [insertId, plan.id, now.toISOString().slice(0, 19).replace("T", " "), periodEnd.toISOString().slice(0, 19).replace("T", " ")]
          );
        }
      }

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

    // Send verification email (non-blocking for the response)
    const locale = request.headers.get("x-locale") || "es";
    sendVerificationEmail(email.toLowerCase(), verificationToken, locale, { appUrl: request.nextUrl.origin }).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Account created. Please check your email to verify your account.",
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
