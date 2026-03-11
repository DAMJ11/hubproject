import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

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
    const { content, messageType } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, message: "El contenido del mensaje es requerido" }, { status: 400 });
    }

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
