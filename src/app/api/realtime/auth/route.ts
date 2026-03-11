import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { getPusherServer } from "@/lib/realtime/pusherServer";

function parseChannelName(channelName: string) {
  const userMatch = channelName.match(/^private-user-(\d+)$/);
  if (userMatch) return { type: "user" as const, id: Number(userMatch[1]) };

  const convMatch = channelName.match(/^private-conversation-(\d+)$/);
  if (convMatch) return { type: "conversation" as const, id: Number(convMatch[1]) };

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json({ message: "Realtime no configurado" }, { status: 503 });
    }

    const form = await request.formData();
    const socketId = String(form.get("socket_id") ?? "");
    const channelName = String(form.get("channel_name") ?? "");

    if (!socketId || !channelName) {
      return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
    }

    const parsed = parseChannelName(channelName);
    if (!parsed) {
      return NextResponse.json({ message: "Canal inválido" }, { status: 403 });
    }

    if (parsed.type === "user") {
      if (parsed.id !== user.id) {
        return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
      }
      const auth = pusher.authorizeChannel(socketId, channelName);
      return NextResponse.json(auth);
    }

    const conversation = await queryOne<{
      id: number;
      brand_company_id: number | null;
      manufacturer_company_id: number | null;
      target_company_id: number | null;
      admin_user_id: number | null;
    }>(
      `SELECT id, brand_company_id, manufacturer_company_id, target_company_id, admin_user_id
       FROM conversations
       WHERE id = ?`,
      [parsed.id]
    );

    if (!conversation) {
      return NextResponse.json({ message: "Conversación no encontrada" }, { status: 404 });
    }

    const isAdmin = hasRole(user, "admin");
    const isAdminOwner = conversation.admin_user_id === user.id;
    const isMember = !!user.companyId && (
      conversation.brand_company_id === user.companyId ||
      conversation.manufacturer_company_id === user.companyId ||
      conversation.target_company_id === user.companyId
    );

    if (!isAdmin && !isAdminOwner && !isMember) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    console.error("Error in realtime auth:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
