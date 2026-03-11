import { query, queryOne } from "@/lib/db";
import {
  conversationPrivateChannel,
  getPusherServer,
  userPrivateChannel,
} from "@/lib/realtime/pusherServer";

interface ConversationParticipants {
  id: number;
  brand_company_id: number | null;
  manufacturer_company_id: number | null;
  target_company_id: number | null;
  admin_user_id: number | null;
}

export async function notifyConversationParticipants(
  conversationId: number,
  eventName: string,
  payload: Record<string, unknown>
) {
  const pusher = getPusherServer();
  if (!pusher) return;

  const conversation = await queryOne<ConversationParticipants>(
    `SELECT id, brand_company_id, manufacturer_company_id, target_company_id, admin_user_id
     FROM conversations
     WHERE id = ?
     LIMIT 1`,
    [conversationId]
  );

  if (!conversation) return;

  const companyIds = [
    conversation.brand_company_id,
    conversation.manufacturer_company_id,
    conversation.target_company_id,
  ].filter((id): id is number => Boolean(id));

  const users = companyIds.length
    ? await query<Array<{ id: number }>>(
        `SELECT id FROM users WHERE company_id IN (${companyIds.map(() => "?").join(",")})`,
        companyIds
      )
    : [];

  const userIds = new Set<number>(users.map((u) => u.id));
  if (conversation.admin_user_id) userIds.add(conversation.admin_user_id);

  const data = {
    conversationId,
    ...payload,
  };

  await pusher.trigger(conversationPrivateChannel(conversationId), eventName, data);

  await Promise.all(
    Array.from(userIds).map((userId) =>
      pusher.trigger(userPrivateChannel(userId), eventName, data)
    )
  );
}
