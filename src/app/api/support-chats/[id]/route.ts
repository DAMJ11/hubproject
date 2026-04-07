import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { getPusherServer, userPrivateChannel } from "@/lib/realtime/pusherServer";

// GET /api/support-chats/[id] - Obtener chat específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const chatId = parseInt(id);

    const chat = await queryOne<{
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
    }>(
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
       WHERE sc.id = ?
       AND (sc.initiated_by_user_id = ? OR ? = 1)`,
      [chatId, user.id, user.role === "admin" ? 1 : 0]
    );

    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat no encontrado" },
        { status: 404 }
      );
    }

    // Obtener mensajes
    const messages = await query<
      Array<{
        id: number;
        content: string;
        sender_user_id: number;
        sender_name: string;
        sender_role: string;
        created_at: string;
      }>
    >(
      `SELECT 
        sm.id,
        sm.content,
        sm.sender_user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS sender_name,
        u.role AS sender_role,
        sm.created_at
       FROM support_messages sm
       JOIN users u ON u.id = sm.sender_user_id
       WHERE sm.support_chat_id = ?
       ORDER BY sm.created_at ASC`,
      [chatId]
    );

    return NextResponse.json({ success: true, chat, messages });
  } catch (error) {
    console.error("Error fetching support chat:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener el chat" },
      { status: 500 }
    );
  }
}

// PUT /api/support-chats/[id] - Admin acepta o responde al chat
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json(
        { success: false, message: "Solo administradores pueden responder" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const chatId = parseInt(id);
    const body = await request.json();
    const { action, messageContent } = body;

    // Validar que el chat existe
    const chat = await queryOne<{ status: string; admin_user_id: number | null }>(
      `SELECT status, admin_user_id FROM support_chats WHERE id = ?`,
      [chatId]
    );

    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat no encontrado" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Admin acepta el chat
      if (chat.admin_user_id !== null && chat.admin_user_id !== user.id) {
        return NextResponse.json(
          { success: false, message: "Otro administrador ya aceptó este chat" },
          { status: 409 }
        );
      }

      await query(
        `UPDATE support_chats SET admin_user_id = ?, status = 'accepted', accepted_at = NOW() WHERE id = ?`,
        [user.id, chatId]
      );

      // Notificar a otros admins que desaparezca de su lista
      const pusher = getPusherServer();
      const allAdmins = await query<Array<{ id: number }>>(
        `SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE AND id != ?`,
        [user.id]
      );

      if (pusher) {
        for (const admin of allAdmins) {
          await pusher.trigger(userPrivateChannel(admin.id), "support-chat-taken", {
            supportChatId: chatId,
            adminName: user.firstName + " " + user.lastName,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Chat aceptado. Ahora puedes responder.",
      });
    }

    if (action === "message" && messageContent) {
      // Admin envía un mensaje
      if (chat.status !== "accepted" || chat.admin_user_id !== user.id) {
        return NextResponse.json(
          { success: false, message: "Solo el admin asignado puede responder" },
          { status: 403 }
        );
      }

      const msgResult = await query(
        `INSERT INTO support_messages (support_chat_id, sender_user_id, content) VALUES (?, ?, ?)`,
        [chatId, user.id, messageContent.trim()]
      );

      // Actualizar last message time
      await query(
        `UPDATE support_chats SET updated_at = NOW() WHERE id = ?`,
        [chatId]
      );

      // Notificar al usuario que inició el chat
      const pusher = getPusherServer();
      const chatDetail = await queryOne<{ initiated_by_user_id: number }>(
        `SELECT initiated_by_user_id FROM support_chats WHERE id = ?`,
        [chatId]
      );

      if (chatDetail && pusher) {
        await pusher.trigger(
          userPrivateChannel(chatDetail.initiated_by_user_id),
          "support-chat-message",
          {
            supportChatId: chatId,
            senderName: user.firstName + " " + user.lastName,
            messagePreview: messageContent.substring(0, 50),
          }
        );
      }

      return NextResponse.json({
        success: true,
        messageId: (msgResult as unknown as { insertId: number }).insertId,
      });
    }

    if (action === "close") {
      // Admin cierra el chat
      if (chat.admin_user_id !== user.id) {
        return NextResponse.json(
          { success: false, message: "Solo el admin asignado puede cerrar" },
          { status: 403 }
        );
      }

      await query(
        `UPDATE support_chats SET status = 'closed', closed_at = NOW() WHERE id = ?`,
        [chatId]
      );

      return NextResponse.json({ success: true, message: "Chat cerrado." });
    }

    return NextResponse.json(
      { success: false, message: "Acción no válida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating support chat:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar el chat" },
      { status: 500 }
    );
  }
}
