import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { notifyConversationParticipants } from "@/lib/realtime/notifyConversation";
import { sendMessageSchema } from "@/lib/validations/conversations";
import { createNotification } from "@/lib/notifications";

// GET /api/conversations/[id]/messages - Obtener mensajes de una conversación
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
    const conversationId = Number(id);

    // Verificar acceso a la conversación
    const conversation = await queryOne<{
      id: number;
      status: string;
      brand_company_id: number | null;
      manufacturer_company_id: number | null;
      target_company_id: number | null;
      admin_user_id: number | null;
    }>(
      `SELECT id, status, brand_company_id, manufacturer_company_id, target_company_id, admin_user_id FROM conversations WHERE id = ?`,
      [conversationId]
    );

    if (!conversation) {
      return NextResponse.json({ success: false, message: "Conversación no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario pertenece a alguna de las empresas o es admin
    const isAdmin = hasRole(user, "admin");
    const isMember = !!user.companyId &&
      (
        conversation.brand_company_id === user.companyId ||
        conversation.manufacturer_company_id === user.companyId ||
        conversation.target_company_id === user.companyId
      );
    const isAdminOwner = conversation.admin_user_id === user.id;

    if (!isAdmin && !isMember && !isAdminOwner) {
      return NextResponse.json({ success: false, message: "No tienes acceso a esta conversación" }, { status: 403 });
    }

    // Obtener mensajes
    const messages = await query<Array<{
      id: number;
      conversation_id: number;
      sender_user_id: number;
      content: string;
      message_type: string;
      file_url: string | null;
      is_read: boolean;
      read_at: string | null;
      created_at: string;
      sender_name: string;
      sender_role: string;
      sender_avatar: string | null;
    }>>(
      `SELECT m.*,
        CONCAT(u.first_name, ' ', u.last_name) AS sender_name,
        u.role AS sender_role,
        u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_user_id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Marcar como leídos los mensajes que no son del usuario actual
    await query(
      `UPDATE messages SET is_read = TRUE, read_at = NOW()
       WHERE conversation_id = ? AND sender_user_id != ? AND is_read = FALSE`,
      [conversationId, user.id]
    );

    await notifyConversationParticipants(conversationId, "chat.messages.read", {
      readerUserId: user.id,
    });
    await notifyConversationParticipants(conversationId, "chat.unread.updated", {
      reason: "messages_read",
      readerUserId: user.id,
    });

    return NextResponse.json({ success: true, messages, conversation });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

// POST /api/conversations/[id]/messages - Enviar un mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const conversationId = Number(id);
    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    const { content, messageType } = parsed.data;

    // Verificar que la conversación existe y está abierta
    const conversation = await queryOne<{
      id: number;
      status: string;
      brand_company_id: number | null;
      manufacturer_company_id: number | null;
      target_company_id: number | null;
      admin_user_id: number | null;
    }>(
      `SELECT id, status, brand_company_id, manufacturer_company_id, target_company_id, admin_user_id FROM conversations WHERE id = ?`,
      [conversationId]
    );

    if (!conversation) {
      return NextResponse.json({ success: false, message: "Conversación no encontrada" }, { status: 404 });
    }

    // Solo se puede enviar mensajes si la conversación está open
    if (conversation.status !== "open") {
      const statusMsg = conversation.status === "pending"
        ? "La solicitud de chat aún no ha sido aceptada"
        : "Esta conversación está cerrada";
      return NextResponse.json({ success: false, message: statusMsg }, { status: 400 });
    }

    // Verificar que el usuario pertenece a alguna de las empresas o es admin
    const isAdmin = hasRole(user, "admin");
    const isMember = !!user.companyId &&
      (
        conversation.brand_company_id === user.companyId ||
        conversation.manufacturer_company_id === user.companyId ||
        conversation.target_company_id === user.companyId
      );
    const isAdminOwner = conversation.admin_user_id === user.id;

    if (!isAdmin && !isMember && !isAdminOwner) {
      return NextResponse.json({ success: false, message: "No tienes acceso a esta conversación" }, { status: 403 });
    }

    const type = messageType || "text";

    // Insertar mensaje
    const result = await query<{ insertId: number }>(
      `INSERT INTO messages (conversation_id, sender_user_id, content, message_type)
       VALUES (?, ?, ?, ?)`,
      [conversationId, user.id, content.trim(), type]
    );

    // Actualizar last_message_at
    await query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
      [conversationId]
    );

    const messageId = (result as unknown as { insertId: number }).insertId;

    await notifyConversationParticipants(conversationId, "chat.message.created", {
      messageId,
      senderUserId: user.id,
      preview: content.trim().slice(0, 120),
      createdAt: new Date().toISOString(),
    });
    await notifyConversationParticipants(conversationId, "chat.unread.updated", {
      reason: "message_created",
      messageId,
      senderUserId: user.id,
    });

    // In-app notification for other participants
    const otherCompanyIds = [
      conversation.brand_company_id,
      conversation.manufacturer_company_id,
      conversation.target_company_id,
    ].filter((cid): cid is number => cid != null && cid !== user.companyId);

    if (otherCompanyIds.length > 0) {
      const placeholders = otherCompanyIds.map(() => "?").join(",");
      const recipients = await query<{ id: number }[]>(
        `SELECT id FROM users WHERE company_id IN (${placeholders})`,
        otherCompanyIds
      );
      for (const r of (recipients as unknown as { id: number }[])) {
        createNotification({
          userId: r.id,
          title: "Nuevo mensaje",
          message: `${user.firstName} ${user.lastName}: ${content.trim().slice(0, 80)}${content.trim().length > 80 ? "..." : ""}`,
          type: "message",
          referenceType: "conversation",
          referenceId: conversationId,
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        conversation_id: conversationId,
        sender_user_id: user.id,
        sender_name: `${user.firstName} ${user.lastName}`,
        content: content.trim(),
        message_type: type,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
