import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface AddressItem {
  id: number;
  label: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export async function getAddresses(): Promise<AddressItem[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const addresses = await query<AddressItem[]>(
    `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
    [user.id]
  );

  return addresses || [];
}
