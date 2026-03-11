import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// PUT /api/conversations/[id]/respond - Aceptar o rechazar solicitud de chat
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const conversationId = Number(id);

    const body = await request.json();
    const { action } = body; // "accept" | "reject"

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ success: false, message: "action debe ser 'accept' o 'reject'" }, { status: 400 });
    }

    // Obtener la conversación
    const conversation = await queryOne<{
      id: number;
      status: string;
      brand_company_id: number;
      manufacturer_company_id: number;
      initiated_by_user_id: number;
    }>(
      `SELECT id, status, brand_company_id, manufacturer_company_id, initiated_by_user_id
       FROM conversations WHERE id = ?`,
      [conversationId]
    );

    if (!conversation) {
      return NextResponse.json({ success: false, message: "Conversación no encontrada" }, { status: 404 });
    }

    if (conversation.status !== "pending") {
      return NextResponse.json({ success: false, message: "Esta conversación no está pendiente" }, { status: 400 });
    }

    // Verificar que el usuario que responde es de la empresa receptora (no la que inició)
    const isRecipient =
      (conversation.brand_company_id === user.companyId || conversation.manufacturer_company_id === user.companyId) &&
      conversation.initiated_by_user_id !== user.id;

    // Admin también puede aceptar/rechazar
    if (!isRecipient && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Solo la empresa receptora puede responder" }, { status: 403 });
    }

    if (action === "accept") {
      await query(
        `UPDATE conversations SET status = 'open', accepted_at = NOW() WHERE id = ?`,
        [conversationId]
      );

      // Agregar un mensaje de sistema indicando la aceptación
      await query(
        `INSERT INTO messages (conversation_id, sender_user_id, content, message_type)
         VALUES (?, ?, 'Solicitud de chat aceptada. Ya pueden intercambiar mensajes.', 'system')`,
        [conversationId, user.id]
      );
      await query(
        `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
        [conversationId]
      );

      return NextResponse.json({ success: true, message: "Chat aceptado" });
    } else {
      await query(
        `UPDATE conversations SET status = 'closed' WHERE id = ?`,
        [conversationId]
      );

      return NextResponse.json({ success: true, message: "Chat rechazado" });
    }
  } catch (error) {
    console.error("Error responding to conversation:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
