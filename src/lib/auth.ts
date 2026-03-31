import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserRole } from "@/types/user";

let _jwtSecret: string | null = null;

function getJwtSecret(): string {
  if (!_jwtSecret) {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === "your-secret-key" || secret === "your-super-secret-jwt-key-change-in-production") {
      if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET must be set to a secure random value in production");
      }
      _jwtSecret = "dev-only-insecure-key-do-not-use-in-prod";
    } else {
      _jwtSecret = secret;
    }
  }
  return _jwtSecret;
}

export interface UserPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: number | null;
}

export interface JWTPayload extends UserPayload {
  iat: number;
  exp: number;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Get auth cookie
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("auth_token");
  return cookie?.value || null;
}

// Remove auth cookie
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

// Get current user from cookie
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}
