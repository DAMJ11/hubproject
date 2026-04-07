import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { getPusherServer, userPrivateChannel } from "@/lib/realtime/pusherServer";

// POST /api/support-chats - Crear nuevo chat de soporte (usuario regular)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Subject y message son requeridos" },
        { status: 400 }
      );
    }

    // Crear el chat de soporte
    const result = await query<{ insertId: number }>(
      `INSERT INTO support_chats (initiated_by_user_id, subject, message, status)
       VALUES (?, ?, ?, 'pending')`,
      [user.id, subject.trim(), message.trim()]
    );

    const supportChatId = (result as unknown as { insertId: number }).insertId;

    // Obtener todos los admins
    const admins = await query<Array<{ id: number; first_name: string; last_name: string }>>(
      `SELECT id, first_name, last_name FROM users WHERE role = 'admin' AND is_active = TRUE`
    );

    // Notificar a cada admin vía Pusher
    const pusher = getPusherServer();
    if (pusher) {
      for (const admin of admins) {
        await pusher.trigger(userPrivateChannel(admin.id), "support-chat-pending", {
          supportChatId,
          subject,
          initiatorName: user.firstName + " " + user.lastName,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(
      { success: true, supportChatId, message: "Chat de soporte creado. Un administrador responderá pronto." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating support chat:", error);
    return NextResponse.json(
      { success: false, message: "Error al crear el chat de soporte" },
      { status: 500 }
    );
  }
}

// GET /api/support-chats - Listar chats de soporte (admins)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json(
        { success: false, message: "Solo administradores pueden ver soporte chats" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "pending"; // pending | accepted | all

    let whereClause = "1=1";
    const params: (string | number)[] = [];

    if (statusFilter !== "all") {
      whereClause = "sc.status = ?";
      params.push(statusFilter);
    }

    const chats = await query<
      Array<{
        id: number;
        subject: string;
        message: string;
        status: string;
        admin_user_id: number | null;
        initiated_by_user_id: number;
        initiator_name: string;
        initiator_email: string;
        accepted_at: string | null;
        created_at: string;
        admin_name: string | null;
      }>
    >(
      `SELECT 
        sc.id, 
        sc.subject, 
        sc.message, 
        sc.status, 
        sc.admin_user_id,
        sc.initiated_by_user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS initiator_name,
        u.email AS initiator_email,
        sc.accepted_at,
        sc.created_at,
        CONCAT(adm.first_name, ' ', adm.last_name) AS admin_name
       FROM support_chats sc
       JOIN users u ON u.id = sc.initiated_by_user_id
       LEFT JOIN users adm ON adm.id = sc.admin_user_id
       WHERE ${whereClause}
       ORDER BY sc.created_at DESC`,
      params
    );

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching support chats:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener chats de soporte" },
      { status: 500 }
    );
  }
}
