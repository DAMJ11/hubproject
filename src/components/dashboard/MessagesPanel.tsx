"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Send,
  Search,
  MoreVertical,
  Loader2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ArrowLeft,
  Building2,
  Check,
  CheckCheck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { emitUnreadMessagesRefresh, setViewingConversationId } from "@/hooks/useUnreadMessagesCount";
import { getPusherClient } from "@/lib/realtime/pusherClient";
import { useTranslations, useLocale } from "next-intl";

interface Conversation {
  id: number;
  rfq_id: number | null;
  subject: string | null;
  status: string;
  last_message_at: string | null;
  created_at: string;
  accepted_at: string | null;
  brand_company_id: number | null;
  manufacturer_company_id: number | null;
  target_company_id: number | null;
  admin_user_id: number | null;
  initiated_by_user_id: number;
  brand_name: string | null;
  manufacturer_name: string | null;
  target_company_name: string | null;
  admin_user_name: string | null;
  brand_logo: string | null;
  manufacturer_logo: string | null;
  rfq_code: string | null;
  rfq_title: string | null;
  initiator_name: string;
  unread_count: number;
  last_message: string | null;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string | null;
  pending?: boolean;
  failed?: boolean;
}

interface CompanyResult {
  id: number;
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  is_verified: boolean;
}

interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  companyId: number | null;
}

interface RfqOption {
  id: number;
  code: string;
  title: string;
  status: string;
}

export default function MessagesPanel() {
  const searchParams = useSearchParams();
  const t = useTranslations("MessagesPanel");
  const locale = useLocale();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"chats" | "pending" | "search">(
    searchParams.get("tab") === "pending" ? "pending" : "chats"
  );

  // Moderation state
  const [sendError, setSendError] = useState<string | null>(null);
  const [chatBlocked, setChatBlocked] = useState(false);
  const [appealStatus, setAppealStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [appealSubmitting, setAppealSubmitting] = useState(false);

  // Busqueda de empresas
  const [companySearch, setCompanySearch] = useState("");
  const [companyResults, setCompanyResults] = useState<CompanyResult[]>([]);
  const [companySearching, setCompanySearching] = useState(false);

  // Nuevo chat modal
  const [newChatTarget, setNewChatTarget] = useState<CompanyResult | null>(null);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const [selectedRfqId, setSelectedRfqId] = useState<number | null>(null);
  const [rfqOptions, setRfqOptions] = useState<RfqOption[]>([]);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [createChatError, setCreateChatError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgIdRef = useRef<number>(0);
  const prefillHandledRef = useRef(false);
  const selectedConvRef = useRef<Conversation | null>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        const fresh: Conversation[] = data.conversations ?? [];
        const currentId = selectedConvRef.current?.id;
        // Si el usuario está viendo una conversación, mantener unread_count en 0
        const adjusted = fresh.map((c) =>
          c.id === currentId ? { ...c, unread_count: 0 } : c
        );
        setConversations(adjusted);
        // Solo actualizar selectedConv si cambió el status (evita re-render innecesario)
        setSelectedConv((prev) => {
          if (!prev) return prev;
          const updated = adjusted.find((c) => c.id === prev.id);
          if (!updated) return prev;
          if (updated.status === prev.status) return prev;
          return updated;
        });
      }
    } catch {
      // noop
    }
  }, []);

  // Cargar usuario y conversaciones
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
    ])
      .then(([userData, convData]) => {
        if (userData.user) setUser(userData.user);
        setConversations(convData.conversations ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Cargar mensajes cuando se selecciona conversacion
  const loadMessages = useCallback(async (convId: number, isPolling = false) => {
    if (!isPolling) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      if (data.success) {
        const msgs: Message[] = data.messages ?? [];
        const newLastId = msgs.length > 0 ? msgs[msgs.length - 1].id : 0;
        // Merge server messages with any local pending messages to avoid losing optimistic UI
        setMessages((prev) => {
          const pendingLocal = prev.filter((m) => (m as Message).pending);
          // Keep pending messages that aren't already present on server
          const pendingToAppend = pendingLocal.filter((p) => !msgs.some((s) => s.id === p.id));
          const merged = [...msgs, ...pendingToAppend];
          return merged;
        });
        if (!isPolling) lastMsgIdRef.current = newLastId;
        else if (newLastId !== lastMsgIdRef.current) lastMsgIdRef.current = newLastId;
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
        );
        emitUnreadMessagesRefresh();
      }
    } catch (e) {
      console.error("Error loading messages:", e);
    } finally {
      if (!isPolling) setMessagesLoading(false);
    }
  }, []);

  // Mantener ref sincronizada con la conversação seleccionada
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // Notificar al hook global qué conversación está siendo vista (para badge correcto)
  useEffect(() => {
    const id = selectedConv?.status === "open" ? (selectedConv?.id ?? null) : null;
    setViewingConversationId(id);
    if (id) emitUnreadMessagesRefresh();
    return () => {
      setViewingConversationId(null);
      emitUnreadMessagesRefresh();
    };
  }, [selectedConv?.id, selectedConv?.status]);

  // Cargar mensajes cuando cambia la conversación seleccionada (solo por id o status)
  useEffect(() => {
    if (selectedConv && selectedConv.status === "open") {
      lastMsgIdRef.current = 0;
      loadMessages(selectedConv.id);
    } else {
      setMessages([]);
      lastMsgIdRef.current = 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?.id, selectedConv?.status]);

  // Check moderation block status when selecting a conversation
  useEffect(() => {
    setChatBlocked(false);
    setAppealStatus("none");
    setSendError(null);
    setShowAppealForm(false);
    setAppealText("");

    if (!selectedConv || selectedConv.status !== "open") return;

    const checkBlockStatus = async () => {
      try {
        const res = await fetch(`/api/chat-appeals?conversationId=${selectedConv.id}`);
        const data = await res.json();
        if (data.success) {
          if (data.blocked) {
            setChatBlocked(true);
            if (data.appeal?.status === "pending") {
              setAppealStatus("pending");
            } else if (data.appeal?.status === "rejected") {
              setAppealStatus("rejected");
            }
          }
        }
      } catch {
        // noop — assume not blocked
      }
    };
    checkBlockStatus();
  }, [selectedConv]);

  // Scroll to bottom on new messages (only when there are messages to show)
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Polling: mensajes cada 4s, lista de conversaciones cada 10s
  useEffect(() => {
    if (selectedConv && selectedConv.status === "open") {
      pollRef.current = setInterval(() => {
        loadMessages(selectedConv.id, true);
      }, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?.id, selectedConv?.status]);

  // Polling para lista de conversaciones (unread badges, ultimo mensaje)
  useEffect(() => {
    const convPoll = setInterval(async () => {
      await refreshConversations();
    }, 10000);
    return () => clearInterval(convPoll);
  }, [refreshConversations]);

  // Realtime de usuario: actualiza lista de conversaciones y badges inmediatamente
  useEffect(() => {
    if (!user?.id) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${user.id}`;
    const channel = pusher.subscribe(channelName);

    const onConversationChange = async () => {
      await refreshConversations();
      emitUnreadMessagesRefresh();
    };

    channel.bind("chat.unread.updated", onConversationChange);
    channel.bind("chat.message.created", onConversationChange);
    channel.bind("chat.conversation.updated", onConversationChange);

    return () => {
      channel.unbind("chat.unread.updated", onConversationChange);
      channel.unbind("chat.message.created", onConversationChange);
      channel.unbind("chat.conversation.updated", onConversationChange);
      pusher.unsubscribe(channelName);
    };
  }, [refreshConversations, user?.id]);

  // Realtime de conversación activa: recarga mensajes al llegar nuevos eventos
  useEffect(() => {
    if (!selectedConv || selectedConv.status !== "open") return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-conversation-${selectedConv.id}`;
    const channel = pusher.subscribe(channelName);

    const onMessageCreated = async () => {
      await loadMessages(selectedConv.id, true);
    };

    const onConversationUpdated = async () => {
      await refreshConversations();
    };

    channel.bind("chat.message.created", onMessageCreated);
    channel.bind("chat.conversation.updated", onConversationUpdated);

    return () => {
      channel.unbind("chat.message.created", onMessageCreated);
      channel.unbind("chat.conversation.updated", onConversationUpdated);
      pusher.unsubscribe(channelName);
    };
  }, [loadMessages, refreshConversations, selectedConv]);

  // Cargar opciones de RFQ para el nuevo chat según rol y empresa destino
  useEffect(() => {
    if (!newChatTarget || !user || user.role === "admin") {
      setRfqOptions([]);
      setSelectedRfqId(null);
      return;
    }

    let cancelled = false;

    const loadRfqOptions = async () => {
      setRfqLoading(true);
      try {
        const res = await fetch(`/api/conversations/rfq-options?targetCompanyId=${newChatTarget.id}`);
        const data = await res.json();

        if (!cancelled && data.success) {
          const options = (data.data ?? []) as RfqOption[];
          setRfqOptions(options);
          setSelectedRfqId((prev) => {
            if (prev && options.some((opt) => opt.id === prev)) return prev;
            return options.length > 0 ? options[0].id : null;
          });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setRfqOptions([]);
          setSelectedRfqId(null);
        }
      } finally {
        if (!cancelled) setRfqLoading(false);
      }
    };

    loadRfqOptions();

    return () => {
      cancelled = true;
    };
  }, [newChatTarget, user]);

  // Prefill desde URL: targetCompanyId, rfqId, subject, message
  useEffect(() => {
    if (!user || prefillHandledRef.current) return;

    const targetCompanyId = Number(searchParams.get("targetCompanyId"));
    if (!targetCompanyId || Number.isNaN(targetCompanyId)) {
      prefillHandledRef.current = true;
      return;
    }

    const rfqId = Number(searchParams.get("rfqId"));
    const subject = searchParams.get("subject") || "";
    const message = searchParams.get("message") || "";

    prefillHandledRef.current = true;
    setTab("search");
    setSelectedConv(null);
    setCreateChatError("");

    const hydrateTarget = async () => {
      try {
        const res = await fetch(`/api/companies?id=${targetCompanyId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setNewChatTarget(data.data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    hydrateTarget();
    setNewChatSubject(subject);
    setNewChatMessage(message);
    if (rfqId && !Number.isNaN(rfqId)) {
      setSelectedRfqId(rfqId);
    }
  }, [searchParams, user]);

  // Buscar empresas
  useEffect(() => {
    if (companySearch.trim().length < 2) {
      setCompanyResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCompanySearching(true);
      try {
        const res = await fetch(`/api/companies/search?q=${encodeURIComponent(companySearch)}`);
        const data = await res.json();
        if (data.success) setCompanyResults(data.companies ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setCompanySearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [companySearch]);

  // Enviar mensaje
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || sending || chatBlocked) return;
    setSendError(null);
    const tempId = -Date.now();
    const tempMsg: Message = {
      id: tempId,
      conversation_id: selectedConv.id,
      sender_user_id: user?.id ?? 0,
      content: newMessage.trim(),
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      sender_name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
      sender_role: user?.role ?? "",
      sender_avatar: null,
      pending: true,
    };

    // Optimistic update: mostrar mensaje inmediatamente
    setMessages((prev) => [...prev, tempMsg]);
    lastMsgIdRef.current = tempId;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, last_message: tempMsg.content, last_message_at: tempMsg.created_at }
          : c
      )
    );
    emitUnreadMessagesRefresh();
    setNewMessage("");
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempMsg.content }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        // Reemplazar mensaje temporal por el mensaje real del servidor
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
        lastMsgIdRef.current = data.message.id;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id
              ? { ...c, last_message: data.message.content, last_message_at: data.message.created_at }
              : c
          )
        );
        emitUnreadMessagesRefresh();
      } else {
        // Remove optimistic message on moderation error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));

        if (data.code === "CHAT_BLOCKED") {
          setChatBlocked(true);
          setAppealStatus("none");
        } else if (data.code === "CONTENT_VIOLATION") {
          const current = data.violations ?? 0;
          const remaining = data.remaining ?? 0;
          setSendError(
            t("moderation.warning", { current, max: current + remaining, remaining })
          );
        } else {
          setMessages((prev) => [...prev, { ...tempMsg, pending: false, failed: true }]);
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  // Submit appeal
  const handleSubmitAppeal = async () => {
    if (!selectedConv || !appealText.trim() || appealSubmitting) return;
    setAppealSubmitting(true);
    try {
      const res = await fetch("/api/chat-appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          appealText: appealText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppealStatus("pending");
        setShowAppealForm(false);
        setAppealText("");
      } else {
        setSendError(data.message || t("moderation.appealError"));
      }
    } catch {
      setSendError(t("moderation.appealError"));
    } finally {
      setAppealSubmitting(false);
    }
  };

  // Crear nueva conversacion
  const handleCreateChat = async () => {
    if (!newChatTarget || !newChatSubject.trim() || creatingChat) return;
    setCreateChatError("");

    if (user?.role !== "admin" && !selectedRfqId) {
      setCreateChatError(t("newChat.selectProject"));
      return;
    }

    setCreatingChat(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCompanyId: newChatTarget.id,
          subject: newChatSubject,
          initialMessage: newChatMessage,
          rfqId: selectedRfqId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const convRes = await fetch("/api/conversations");
        const convData = await convRes.json();
        setConversations(convData.conversations ?? []);
        emitUnreadMessagesRefresh();
        setNewChatTarget(null);
        setNewChatSubject("");
        setNewChatMessage("");
        setSelectedRfqId(null);
        setRfqOptions([]);
        setTab(user?.role === "admin" ? "chats" : "pending");
      } else {
        setCreateChatError(data.message || t("errors.createFailed"));
      }
    } catch (e) {
      console.error(e);
      setCreateChatError(t("errors.networkError"));
    } finally {
      setCreatingChat(false);
    }
  };

  // Aceptar / Rechazar conversacion
  const handleRespond = async (convId: number, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/conversations/${convId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        const convRes = await fetch("/api/conversations");
        const convData = await convRes.json();
        setConversations(convData.conversations ?? []);
        emitUnreadMessagesRefresh();
        if (action === "accept") {
          const accepted = convData.conversations?.find((c: Conversation) => c.id === convId);
          if (accepted) {
            setSelectedConv(accepted);
            setTab("chats");
          }
        } else {
          if (selectedConv?.id === convId) setSelectedConv(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helpers
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const getOtherPartyName = (conv: Conversation) => {
    if (!user) return conv.target_company_name || conv.brand_name || conv.manufacturer_name || t("defaults.conversation");
    if (conv.admin_user_id) {
      if (user.role === "admin") return conv.target_company_name || t("defaults.company");
      return conv.admin_user_name || t("defaults.admin");
    }
    if (user.role === "admin") return `${conv.brand_name || "-"} ? ${conv.manufacturer_name || "-"}`;
    if (user.companyId && conv.brand_company_id === user.companyId) return conv.manufacturer_name || t("companyType.manufacturer");
    return conv.brand_name || t("companyType.brand");
  };

  const getOtherPartyType = (conv: Conversation) => {
    if (!user) return "";
    if (conv.admin_user_id) {
      return user.role === "admin" ? t("defaults.company") : t("defaults.admin");
    }
    if (user.role === "admin") return t("defaults.b2b");
    if (user.companyId === conv.brand_company_id) return t("companyType.manufacturer");
    return t("companyType.brand");
  };

  const openConversations = conversations.filter((c) => c.status === "open");
  const pendingConversations = conversations.filter((c) => c.status === "pending");

  const filteredConversations = (tab === "pending" ? pendingConversations : openConversations).filter(
    (c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        getOtherPartyName(c).toLowerCase().includes(q) ||
        (c.subject ?? "").toLowerCase().includes(q)
      );
    }
  );

  const isPendingForMe = (conv: Conversation) => {
    if (!user) return false;
    return conv.status === "pending" && conv.initiated_by_user_id !== user.id;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50 dark:bg-slate-900">
      {/* ============ LEFT SIDEBAR (WhatsApp dark) ============ */}
      <div className={`w-full md:w-[420px] flex flex-col border-r border-slate-200 dark:border-slate-700 ${selectedConv || (tab === "search" && newChatTarget) ? "hidden md:flex" : "flex"}`}>
        {/* Sidebar Header */}
        <div className="bg-white dark:bg-slate-800 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("header.title")}</h2>
            <Button
              size="sm"
              onClick={() => {
                setTab("search");
                setSelectedConv(null);
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white gap-1 rounded-lg text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" /> {t("header.newButton")}
            </Button>
          </div>

          {tab !== "search" && (
            <>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setTab("chats")}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    tab === "chats"
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {t("tabs.active", { count: openConversations.length })}
                </button>
                <button
                  onClick={() => setTab("pending")}
                  className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                    tab === "pending"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  <Clock className="w-3 h-3" /> {t("tabs.pending", { count: pendingConversations.length })}
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-sm rounded-lg border-none outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </>
          )}
        </div>

        {/* Search: buscar empresas */}
        {tab === "search" && (
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setTab("chats");
                  setNewChatTarget(null);
                  setSelectedRfqId(null);
                  setRfqOptions([]);
                  setCreateChatError("");
                }}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t("search.back")}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {user?.role === "admin"
                  ? t("search.hintAdmin")
                  : user?.role === "brand" ? t("search.hintBrand") : t("search.hintManufacturer")}
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  placeholder={user?.role === "admin"
                    ? t("search.inputAdmin")
                    : user?.role === "brand" ? t("search.inputBrand") : t("search.inputManufacturer")}
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-sm rounded-lg border-none outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-1 focus:ring-brand-600"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {companySearching && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500 dark:text-slate-400" />
                </div>
              )}
              {!companySearching && companyResults.length === 0 && companySearch.trim().length >= 2 && (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">{t("search.noResults")}</div>
              )}
              {companyResults.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setNewChatTarget(company);
                    setCreateChatError("");
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left border-b border-slate-200 dark:border-slate-700 ${
                    newChatTarget?.id === company.id
                      ? "bg-slate-100 dark:bg-slate-800"
                      : "hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {company.logo_url ? (
                      <Image src={company.logo_url} alt={`${company.name} logo`} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-white truncate">{company.name}</span>
                      {company.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {company.city ?? t("defaults.location")} &bull; {company.type === "manufacturer" ? t("companyType.manufacturer") : t("companyType.brand")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de conversaciones */}
        {tab !== "search" && (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            {filteredConversations.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">
                {tab === "pending" ? t("list.emptyPending") : t("list.emptyActive")}
              </div>
            )}
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left border-b border-slate-200 dark:border-slate-700 ${
                  selectedConv?.id === conv.id
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      conv.status === "pending" ? "bg-amber-500" : "bg-brand-600"
                    }`}
                  >
                    <span className="text-white font-medium text-sm">
                      {getInitials(getOtherPartyName(conv))}
                    </span>
                  </div>
                  {conv.status === "pending" && (
                    <Clock className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-amber-500 bg-slate-50 dark:bg-slate-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[15px] text-slate-900 dark:text-white truncate">
                      {getOtherPartyName(conv)}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${conv.unread_count > 0 ? "text-brand-600" : "text-slate-500 dark:text-slate-400"}`}>
                      {formatTime(conv.last_message_at || conv.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex-1 min-w-0">
                      {conv.status === "pending" ? (
                        <span className="text-xs text-amber-500 font-medium">
                          {isPendingForMe(conv) ? t("list.requestReceived") : t("list.waitingAcceptance")}
                        </span>
                      ) : conv.last_message ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {conv.rfq_code ? `[${conv.rfq_code}] ` : ""}
                          {conv.last_message}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          {conv.rfq_code ? `[${conv.rfq_code}] ` : ""}
                          {conv.subject}
                        </p>
                      )}
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 min-w-[20px] h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============ RIGHT PANEL ============ */}
      <div className={`flex-1 flex flex-col ${!selectedConv && !(tab === "search" && newChatTarget) ? "hidden md:flex" : "flex"}`}>
        {/* Nuevo chat: formulario */}
        {tab === "search" && newChatTarget && (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {user?.role === "admin" ? t("newChat.titleAdmin") : t("newChat.titleUser")}
              </h3>
              <div className="flex items-center gap-3 mb-4 bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {getInitials(newChatTarget.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{newChatTarget.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {newChatTarget.type === "manufacturer" ? t("companyType.manufacturer") : t("companyType.brand")} &bull; {newChatTarget.city ?? t("defaults.location")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {user?.role === "admin"
                  ? t("newChat.infoAdmin")
                  : t("newChat.infoUser")}
              </p>
              <div className="space-y-3">
                {user?.role !== "admin" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {user?.role === "brand" ? t("newChat.rfqLabelBrand") : t("newChat.rfqLabelManufacturer")}
                    </label>
                    {rfqLoading ? (
                      <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("newChat.loadingProjects")}
                      </div>
                    ) : rfqOptions.length === 0 ? (
                      <div className="w-full px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-lg text-xs">
                        {user?.role === "brand"
                          ? t("newChat.noProjectsBrand")
                          : t("newChat.noProjectsManufacturer")}
                      </div>
                    ) : (
                      <select
                        value={selectedRfqId ?? ""}
                        onChange={(e) => setSelectedRfqId(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-sm rounded-lg border-none outline-none focus:ring-1 focus:ring-brand-600"
                      >
                        {rfqOptions.map((rfq) => (
                          <option key={rfq.id} value={rfq.id}>
                            {rfq.code} - {rfq.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t("newChat.subjectLabel")}</label>
                  <input
                    placeholder={t("newChat.subjectPlaceholder")}
                    value={newChatSubject}
                    onChange={(e) => setNewChatSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-sm rounded-lg border-none outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t("newChat.messageLabel")}</label>
                  <textarea
                    placeholder={t("newChat.messagePlaceholder")}
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-none px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-sm outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-1 focus:ring-brand-600 resize-none"
                  />
                </div>
                {createChatError && (
                  <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {createChatError}
                  </div>
                )}
                <Button
                  onClick={handleCreateChat}
                  disabled={!newChatSubject.trim() || creatingChat || (user?.role !== "admin" && (!selectedRfqId || rfqOptions.length === 0))}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
                >
                  {creatingChat ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {user?.role === "admin" ? t("newChat.submitAdmin") : t("newChat.submitUser")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "search" && !newChatTarget && (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t("searchEmpty.title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {user?.role === "admin" ? t("searchEmpty.subtitleAdmin") : user?.role === "brand" ? t("searchEmpty.subtitleBrand") : t("searchEmpty.subtitleManufacturer")}
              </p>
            </div>
          </div>
        )}

        {/* Conversacion pendiente seleccionada */}
        {tab !== "search" && selectedConv && selectedConv.status === "pending" && (
          <div className="flex-1 flex flex-col">
            {/* Pending Header */}
            <div className="h-[60px] px-4 flex items-center gap-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getInitials(getOtherPartyName(selectedConv))}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white text-[15px]">{getOtherPartyName(selectedConv)}</h3>
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t("pending.headerStatus")}
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 text-center max-w-md">
                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                {isPendingForMe(selectedConv) ? (
                  <>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {t("pending.incomingTitle", { name: selectedConv.initiator_name })}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t("pending.subjectLabel")} <span className="font-medium text-slate-800 dark:text-slate-200">{selectedConv.subject}</span>
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {t("pending.acceptPrompt")}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleRespond(selectedConv.id, "reject")}
                        className="px-4 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-red-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> {t("pending.reject")}
                      </button>
                      <button
                        onClick={() => handleRespond(selectedConv.id, "accept")}
                        className="px-4 py-2 rounded-lg text-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {t("pending.accept")}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t("pending.sentTitle")}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t("pending.subjectLabel")} <span className="font-medium text-slate-800 dark:text-slate-200">{selectedConv.subject}</span>
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("pending.waitingMessage", { name: getOtherPartyName(selectedConv) })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat activo - WhatsApp style */}
        {tab !== "search" && selectedConv && selectedConv.status === "open" && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-[60px] px-4 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getInitials(getOtherPartyName(selectedConv))}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-[15px]">{getOtherPartyName(selectedConv)}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getOtherPartyType(selectedConv)} &bull; {selectedConv.subject}
                  </p>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Moderation policy banner */}
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {t("moderation.banner")}
              </p>
            </div>

            {/* Send error (moderation warning) */}
            {sendError && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed flex-1">{sendError}</p>
                <button onClick={() => setSendError(null)} className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Messages area with WhatsApp wallpaper */}
            <div
              className="flex-1 overflow-y-auto px-[6%] py-4 space-y-1 bg-white dark:bg-slate-900"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {messagesLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                </div>
              )}
              {!messagesLoading && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="bg-blue-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-4 py-2 rounded-lg shadow">
                    {t("chat.noMessages")}
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.sender_user_id === user?.id;
                const isSystem = msg.message_type === "system";

                // Agrupacion: mostrar hora del bloque
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showDateSep = !prevMsg ||
                  new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center py-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-lg shadow">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex justify-center py-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-lg shadow">
                          {new Date(msg.created_at).toLocaleDateString(locale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-[2px]`}>
                      <div
                        className={`relative max-w-[65%] rounded-lg px-[9px] pt-2 pb-2 shadow grid gap-1 ${
                          isMe
                            ? "bg-brand-600 text-white justify-items-end"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white justify-items-start"
                        }`}
                        style={isMe
                          ? { borderTopRightRadius: "0px" }
                          : { borderTopLeftRadius: "0px" }
                        }
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-0.5">{msg.sender_name}</p>
                        )}
                        <div className="w-full">
                          <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        <div className="w-full flex items-center justify-end text-[11px] gap-1 mt-0.5">
                          <span className={`${isMe ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>{formatTime(msg.created_at)}</span>
                          {isMe && (
                            msg.pending ? (
                              <Loader2 className="w-4 h-4 animate-spin ml-0.5 text-white" />
                            ) : msg.failed ? (
                              <XCircle className="w-4 h-4 text-red-400 ml-0.5" />
                            ) : msg.is_read ? (
                              <CheckCheck className="w-[16px] h-[16px] text-brand-700 ml-0.5" />
                            ) : (
                              <Check className="w-[16px] h-[16px] ml-0.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar / Blocked State */}
            {chatBlocked ? (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                {appealStatus === "pending" ? (
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <p>{t("moderation.appealPending")}</p>
                  </div>
                ) : showAppealForm ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t("moderation.appealTitle")}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("moderation.appealLabel")}</p>
                    <textarea
                      value={appealText}
                      onChange={(e) => setAppealText(e.target.value)}
                      placeholder={t("moderation.appealPlaceholder")}
                      rows={3}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600 text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setShowAppealForm(false); setAppealText(""); }}
                        className="px-3 py-1.5 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        {t("moderation.appealCancel")}
                      </button>
                      <button
                        onClick={handleSubmitAppeal}
                        disabled={appealText.trim().length < 10 || appealSubmitting}
                        className="px-3 py-1.5 text-xs rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors flex items-center gap-1"
                      >
                        {appealSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        {t("moderation.appealSubmit")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <p>{t("moderation.blocked")}</p>
                    </div>
                    <button
                      onClick={() => setShowAppealForm(true)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex-shrink-0"
                    >
                      {t("moderation.appealButton")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 py-2 bg-white dark:bg-slate-800 flex items-end gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-end">
                  <input
                    placeholder={t("chat.inputPlaceholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 bg-transparent text-slate-800 dark:text-white text-sm px-3 py-[9px] outline-none border-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 flex items-center justify-center text-white disabled:opacity-40 disabled:hover:bg-brand-600 transition-colors flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {tab !== "search" && !selectedConv && (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 border-b-[6px] border-brand-600">
            <div className="text-center max-w-md">
              <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                <MessageSquare className="w-9 h-9 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-[28px] font-light text-slate-900 dark:text-white mb-2">{t("emptyState.title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("emptyState.line1")}
                <br />
                {t("emptyState.line2")}
              </p>
            </div>
          </div>
        )}

        {/* Conversation closed/archived */}
        {tab !== "search" && selectedConv && selectedConv.status !== "open" && selectedConv.status !== "pending" && (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t("closed.title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("closed.subtitle")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

