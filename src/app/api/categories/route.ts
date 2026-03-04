import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/categories - List all service categories
export async function GET() {
  try {
    const categories = await query(
      `SELECT * FROM service_categories WHERE is_active = TRUE ORDER BY display_order`
    );

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
