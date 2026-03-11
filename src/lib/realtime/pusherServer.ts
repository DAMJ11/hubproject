import Pusher from "pusher";

let instance: Pusher | null = null;

export function getPusherServer() {
  if (instance) return instance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  instance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return instance;
}

export function userPrivateChannel(userId: number) {
  return `private-user-${userId}`;
}

export function conversationPrivateChannel(conversationId: number) {
  return `private-conversation-${conversationId}`;
}
