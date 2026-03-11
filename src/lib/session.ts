import { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "@/lib/auth";
import { cookies } from "next/headers";
import type { UserRole } from "@/types/user";

/**
 * Extrae y valida el usuario del JWT en la cookie.
 * Retorna null si no hay sesión válida.
 */
export async function getSessionUser(request: NextRequest): Promise<(JWTPayload & { companyId: number | null }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return { ...payload, companyId: (payload as JWTPayload & { companyId?: number | null }).companyId ?? null };
}

/**
 * Verifica que el usuario tenga uno de los roles permitidos.
 */
export function hasRole(user: { role: UserRole }, ...roles: UserRole[]): boolean {
  return roles.includes(user.role);
}
