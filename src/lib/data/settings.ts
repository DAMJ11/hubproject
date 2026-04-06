import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface SettingsUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  avatarUrl: string | null;
  preferredCurrency: string;
}

export async function getSettingsUser(): Promise<SettingsUser | null> {
  const jwt = await getCurrentUser();
  if (!jwt) return null;

  const rows = await query<Array<{ phone: string | null; avatar_url: string | null; preferred_currency: string | null }>>(
    "SELECT phone, avatar_url, preferred_currency FROM users WHERE id = ? LIMIT 1",
    [jwt.id]
  );

  return {
    id: jwt.id,
    email: jwt.email,
    firstName: jwt.firstName,
    lastName: jwt.lastName,
    role: jwt.role,
    phone: rows?.[0]?.phone ?? "",
    avatarUrl: rows?.[0]?.avatar_url ?? null,
    preferredCurrency: rows?.[0]?.preferred_currency ?? "USD",
  };
}
