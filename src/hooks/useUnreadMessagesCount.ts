"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPusherClient } from "@/lib/realtime/pusherClient";

const CHAT_UNREAD_REFRESH_EVENT = "chat:unread-refresh";
const CHAT_BROADCAST_CHANNEL = "chat-events";

interface ConversationsResponse {
  success?: boolean;
  conversations?: Array<{ unread_count?: number }>;
}

export function emitUnreadMessagesRefresh() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(CHAT_UNREAD_REFRESH_EVENT));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHAT_BROADCAST_CHANNEL);
    channel.postMessage({ type: CHAT_UNREAD_REFRESH_EVENT, ts: Date.now() });
    channel.close();
  }
}

export function useUnreadMessagesCount(pollIntervalMs = 15000) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const data: ConversationsResponse = await response.json();

      if (!mountedRef.current) return;

      if (!response.ok || data.success === false) {
        setCount(0);
        return;
      }

      const unread = (data.conversations ?? []).reduce((acc, conversation) => {
        return acc + (Number(conversation.unread_count) || 0);
      }, 0);

      setCount(unread);
    } catch {
      if (!mountedRef.current) return;
      setCount(0);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (!mountedRef.current) return;
        setUserId(data?.user?.id ?? null);
      } catch {
        if (!mountedRef.current) return;
        setUserId(null);
      }
    };

    loadUser();
    fetchUnreadCount();

    const pollId = window.setInterval(fetchUnreadCount, pollIntervalMs);

    const onRefresh = () => {
      fetchUnreadCount();
    };

    window.addEventListener(CHAT_UNREAD_REFRESH_EVENT, onRefresh);

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHAT_BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event?.data?.type === CHAT_UNREAD_REFRESH_EVENT) {
          fetchUnreadCount();
        }
      };
    }

    return () => {
      mountedRef.current = false;
      window.clearInterval(pollId);
      window.removeEventListener(CHAT_UNREAD_REFRESH_EVENT, onRefresh);
      channel?.close();
    };
  }, [fetchUnreadCount, pollIntervalMs]);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${userId}`;
    const channel = pusher.subscribe(channelName);

    const onRealtimeUpdate = () => {
      fetchUnreadCount();
    };

    channel.bind("chat.unread.updated", onRealtimeUpdate);
    channel.bind("chat.message.created", onRealtimeUpdate);
    channel.bind("chat.conversation.updated", onRealtimeUpdate);
    channel.bind("chat.messages.read", onRealtimeUpdate);

    return () => {
      channel.unbind("chat.unread.updated", onRealtimeUpdate);
      channel.unbind("chat.message.created", onRealtimeUpdate);
      channel.unbind("chat.conversation.updated", onRealtimeUpdate);
      channel.unbind("chat.messages.read", onRealtimeUpdate);
      pusher.unsubscribe(channelName);
    };
  }, [fetchUnreadCount, userId]);

  return { unreadCount: count, loading, refreshUnreadCount: fetchUnreadCount };
}
