import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  { name: "Design", slug: "design", description: "Concepts, sketches and creative direction", icon: "PenLine", sort_order: 1 },
  { name: "Tech Pack", slug: "tech-pack", description: "Technical specifications for production", icon: "FileText", sort_order: 2 },
  { name: "Sourcing", slug: "sourcing", description: "Materials, trims and supplier matching", icon: "Search", sort_order: 3 },
  { name: "Sampling", slug: "sampling", description: "Prototype development and revisions", icon: "Scissors", sort_order: 4 },
  { name: "Production", slug: "production", description: "Manufacturing with trusted partners", icon: "Cog", sort_order: 5 },
  { name: "Branding", slug: "branding", description: "Content, visuals and brand support", icon: "Sparkles", sort_order: 6 },
];

// GET /api/categories - List all service categories
export async function GET() {
  try {
    let categories = await query(
      `SELECT * FROM service_categories WHERE is_active = TRUE ORDER BY sort_order, name`
    );

    if (!categories || categories.length === 0) {
      await query(
        `INSERT IGNORE INTO service_categories (name, slug, description, icon, is_active, sort_order)
         VALUES ${DEFAULT_CATEGORIES.map(() => `(?, ?, ?, ?, TRUE, ?)`).join(", ")}`,
        DEFAULT_CATEGORIES.flatMap((category) => [category.name, category.slug, category.description, category.icon, category.sort_order])
      );

      categories = await query(
        `SELECT * FROM service_categories WHERE is_active = TRUE ORDER BY sort_order, name`
      );
    }

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
