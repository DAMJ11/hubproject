import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

// Redirige a la nueva API /api/conversations
// Se mantiene para compatibilidad con el panel de dashboard
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const isAdmin = user.role === "admin";

    let whereClause: string;
    const params: (string | number | boolean | null)[] = [];

    if (isAdmin) {
      whereClause = "1=1";
    } else if (!user.companyId) {
      return NextResponse.json({ conversations: [] });
    } else {
      whereClause = "(c.brand_company_id = ? OR c.manufacturer_company_id = ? OR c.target_company_id = ?)";
      params.push(user.companyId, user.companyId, user.companyId);
    }

    params.push(user.id); // para unread_count

    const conversations = await query<Array<{
      id: number;
      subject: string;
      status: string;
      last_message_at: string;
      created_at: string;
      brand_company_id: number;
      manufacturer_company_id: number;
      initiated_by_user_id: number;
      brand_name: string;
      manufacturer_name: string;
      initiator_name: string;
      unread_count: number;
      last_message: string;
    }>>(
      `SELECT c.*,
       bc.name AS brand_name, bc.logo_url AS brand_logo,
       mc.name AS manufacturer_name, mc.logo_url AS manufacturer_logo,
      tc.name AS target_company_name,
      CONCAT(au.first_name, ' ', au.last_name) AS admin_user_name,
       CONCAT(iu.first_name, ' ', iu.last_name) AS initiator_name,
       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_user_id != ?) AS unread_count,
       (SELECT m2.content FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_message
       FROM conversations c
      LEFT JOIN companies bc ON bc.id = c.brand_company_id
      LEFT JOIN companies mc ON mc.id = c.manufacturer_company_id
      LEFT JOIN companies tc ON tc.id = c.target_company_id
      LEFT JOIN users au ON au.id = c.admin_user_id
       JOIN users iu ON iu.id = c.initiated_by_user_id
       WHERE ${whereClause}
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      params
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
