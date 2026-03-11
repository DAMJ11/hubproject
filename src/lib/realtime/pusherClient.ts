"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function getPusherClient() {
  if (typeof window === "undefined") return null;
  if (pusherClient) return pusherClient;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) return null;

  pusherClient = new Pusher(key, {
    cluster,
    channelAuthorization: {
      endpoint: "/api/realtime/auth",
      transport: "ajax",
    },
  });

  return pusherClient;
}
