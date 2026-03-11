import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const categories = await query<Array<{
      id: number;
      name: string;
      slug: string;
      description: string;
      icon: string;
      is_active: boolean;
      sort_order: number;
      services_count: number;
    }>>(
      `SELECT sc.*, COUNT(s.id) as services_count
       FROM service_categories sc
       LEFT JOIN services s ON s.category_id = sc.id AND s.is_active = TRUE
       GROUP BY sc.id
       ORDER BY sc.sort_order`
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
