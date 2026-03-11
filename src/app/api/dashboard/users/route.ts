import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const users = await query<Array<{
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      role: string;
      is_active: boolean;
      created_at: string;
      company_name: string | null;
    }>>(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role,
              u.is_active, u.created_at, c.name as company_name
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
