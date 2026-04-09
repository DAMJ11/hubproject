import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const isAdmin = user.role === "admin" || user.role === "super_admin";

    const reviews = await query<Array<{
      id: number;
      rating: number;
      comment: string;
      is_public: boolean;
      created_at: string;
      client_name: string;
    }>>(
      `SELECT r.*,
       CONCAT(u.first_name, ' ', u.last_name) as client_name
       FROM reviews r
       JOIN users u ON r.reviewer_user_id = u.id
       ${isAdmin ? "" : "WHERE r.reviewer_user_id = ?"}
       ORDER BY r.created_at DESC`,
      isAdmin ? [] : [user.id]
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
