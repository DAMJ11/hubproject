import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const addresses = await query<Array<{
      id: number;
      label: string;
      address_line1: string;
      address_line2: string | null;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      is_default: boolean;
    }>>(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
