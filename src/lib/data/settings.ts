import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface SettingsUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
}

export async function getSettingsUser(): Promise<SettingsUser | null> {
  const jwt = await getCurrentUser();
  if (!jwt) return null;

  const rows = await query<Array<{ phone: string | null }>>(
    "SELECT phone FROM users WHERE id = ? LIMIT 1",
    [jwt.id]
  );

  return {
    id: jwt.id,
    email: jwt.email,
    firstName: jwt.firstName,
    lastName: jwt.lastName,
    role: jwt.role,
    phone: rows?.[0]?.phone ?? "",
  };
}
