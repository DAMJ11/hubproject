"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { emitUnreadMessagesRefresh } from "@/hooks/useUnreadMessagesCount";
import { getPusherClient } from "@/lib/realtime/pusherClient";

interface Conversation {
  id: number;
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
  role: string;
  companyId: number | null;
}

export default function MessagesPanel() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"chats" | "pending" | "search">("chats");

  // Busqueda de empresas
  const [companySearch, setCompanySearch] = useState("");
  const [companyResults, setCompanyResults] = useState<CompanyResult[]>([]);
  const [companySearching, setCompanySearching] = useState(false);

  // Nuevo chat modal
  const [newChatTarget, setNewChatTarget] = useState<CompanyResult | null>(null);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgIdRef = useRef<number>(0);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations ?? []);
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
        // Solo actualizar si hay mensajes nuevos
        if (!isPolling || newLastId !== lastMsgIdRef.current) {
          setMessages(msgs);
          lastMsgIdRef.current = newLastId;
        }
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

  useEffect(() => {
    if (selectedConv && selectedConv.status === "open") {
      lastMsgIdRef.current = 0;
      loadMessages(selectedConv.id);
    } else {
      setMessages([]);
      lastMsgIdRef.current = 0;
    }
  }, [selectedConv, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
  }, [selectedConv, loadMessages]);

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
    if (!newMessage.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        lastMsgIdRef.current = data.message.id;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id
              ? { ...c, last_message: newMessage, last_message_at: new Date().toISOString() }
              : c
          )
        );
        emitUnreadMessagesRefresh();
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  // Crear nueva conversacion
  const handleCreateChat = async () => {
    if (!newChatTarget || !newChatSubject.trim() || creatingChat) return;
    setCreatingChat(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCompanyId: newChatTarget.id,
          subject: newChatSubject,
          initialMessage: newChatMessage,
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
        setTab(user?.role === "admin" ? "chats" : "pending");
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
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
      return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const getOtherPartyName = (conv: Conversation) => {
    if (!user) return conv.target_company_name || conv.brand_name || conv.manufacturer_name || "Conversacion";
    if (conv.admin_user_id) {
      if (user.role === "admin") return conv.target_company_name || "Empresa";
      return conv.admin_user_name || "Administrador";
    }
    if (user.role === "admin") return `${conv.brand_name || "-"} ? ${conv.manufacturer_name || "-"}`;
    if (user.companyId && conv.brand_company_id === user.companyId) return conv.manufacturer_name || "Fabricante";
    return conv.brand_name || "Marca";
  };

  const getOtherPartyType = (conv: Conversation) => {
    if (!user) return "";
    if (conv.admin_user_id) {
      return user.role === "admin" ? "Empresa" : "Administrador";
    }
    if (user.role === "admin") return "B2B";
    if (user.companyId === conv.brand_company_id) return "Fabricante";
    return "Marca";
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
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#f8fafc]">
      {/* ============ LEFT SIDEBAR (WhatsApp dark) ============ */}
      <div className="w-[420px] flex flex-col border-r border-[#e2e8f0]">
        {/* Sidebar Header */}
        <div className="bg-[#ffffff] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#0f172a]">Chats</h2>
            <Button
              size="sm"
              onClick={() => {
                setTab("search");
                setSelectedConv(null);
              }}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-1 rounded-lg text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </Button>
          </div>

          {tab !== "search" && (
            <>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setTab("chats")}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    tab === "chats"
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  Activos ({openConversations.length})
                </button>
                <button
                  onClick={() => setTab("pending")}
                  className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                    tab === "pending"
                      ? "bg-[#f59e0b] text-white"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  <Clock className="w-3 h-3" /> Pendientes ({pendingConversations.length})
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  placeholder="Buscar o empezar un nuevo chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 bg-[#f1f5f9] text-[#1e293b] text-sm rounded-lg border-none outline-none placeholder:text-[#64748b] focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>
            </>
          )}
        </div>

        {/* Search: buscar empresas */}
        {tab === "search" && (
          <div className="flex-1 flex flex-col bg-[#f8fafc]">
            <div className="p-4 bg-[#ffffff] border-b border-[#e2e8f0]">
              <button
                onClick={() => {
                  setTab("chats");
                  setNewChatTarget(null);
                }}
                className="text-xs text-[#2563eb] hover:text-[#1e40af] flex items-center gap-1 mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Volver
              </button>
              <p className="text-xs text-[#64748b] mb-2">
                {user?.role === "admin"
                  ? "Busca cualquier empresa para iniciar chat directo"
                  : `Busca un${user?.role === "brand" ? " fabricante" : "a marca"} para iniciar chat`}
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  placeholder={user?.role === "admin"
                    ? "Buscar marcas o fabricantes..."
                    : `Buscar ${user?.role === "brand" ? "fabricantes" : "marcas"}...`}
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 bg-[#f1f5f9] text-[#1e293b] text-sm rounded-lg border-none outline-none placeholder:text-[#64748b] focus:ring-1 focus:ring-[#2563eb]"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {companySearching && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#64748b]" />
                </div>
              )}
              {!companySearching && companyResults.length === 0 && companySearch.trim().length >= 2 && (
                <div className="text-center py-8 text-xs text-[#64748b]">Sin resultados</div>
              )}
              {companyResults.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setNewChatTarget(company)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left border-b border-[#e2e8f0] ${
                    newChatTarget?.id === company.id
                      ? "bg-[#f1f5f9]"
                      : "hover:bg-[#ffffff]"
                  }`}
                >
                  <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center flex-shrink-0">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-[#64748b]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#0f172a] truncate">{company.name}</span>
                      {company.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#2563eb] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#64748b]">
                      {company.city ?? "Colombia"} &bull; {company.type === "manufacturer" ? "Fabricante" : "Marca"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de conversaciones */}
        {tab !== "search" && (
          <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
            {filteredConversations.length === 0 && (
              <div className="text-center py-12 text-xs text-[#64748b]">
                {tab === "pending" ? "No hay solicitudes pendientes" : "No hay conversaciones activas"}
              </div>
            )}
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left border-b border-[#e2e8f0] ${
                  selectedConv?.id === conv.id
                    ? "bg-[#f1f5f9]"
                    : "hover:bg-[#ffffff]"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      conv.status === "pending" ? "bg-[#f59e0b]" : "bg-[#2563eb]"
                    }`}
                  >
                    <span className="text-white font-medium text-sm">
                      {getInitials(getOtherPartyName(conv))}
                    </span>
                  </div>
                  {conv.status === "pending" && (
                    <Clock className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-[#f59e0b] bg-[#f8fafc] rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[15px] text-[#0f172a] truncate">
                      {getOtherPartyName(conv)}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${conv.unread_count > 0 ? "text-[#2563eb]" : "text-[#64748b]"}`}>
                      {formatTime(conv.last_message_at || conv.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex-1 min-w-0">
                      {conv.status === "pending" ? (
                        <span className="text-xs text-[#f59e0b] font-medium">
                          {isPendingForMe(conv) ? "Solicitud recibida" : "Esperando aceptacion"}
                        </span>
                      ) : conv.last_message ? (
                        <p className="text-sm text-[#64748b] truncate">{conv.last_message}</p>
                      ) : (
                        <p className="text-xs text-[#64748b] italic">{conv.subject}</p>
                      )}
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 min-w-[20px] h-5 bg-[#2563eb] text-white text-xs rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
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
      <div className="flex-1 flex flex-col">
        {/* Nuevo chat: formulario */}
        {tab === "search" && newChatTarget && (
          <div className="flex-1 flex items-center justify-center bg-[#ffffff]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="bg-[#ffffff] rounded-xl shadow-lg border border-[#f1f5f9] p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-[#0f172a] mb-1">
                {user?.role === "admin" ? "Nuevo chat directo" : "Nueva solicitud de chat"}
              </h3>
              <div className="flex items-center gap-3 mb-4 bg-[#f1f5f9] rounded-lg p-3">
                <div className="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {getInitials(newChatTarget.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">{newChatTarget.name}</p>
                  <p className="text-xs text-[#64748b]">
                    {newChatTarget.type === "manufacturer" ? "Fabricante" : "Marca"} &bull; {newChatTarget.city ?? "Colombia"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#64748b] mb-4">
                {user?.role === "admin"
                  ? "El chat se abrira directamente."
                  : "Deberan aceptar tu solicitud antes de poder chatear."}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Asunto</label>
                  <input
                    placeholder="Ej: Consulta de produccion, Cotizacion..."
                    value={newChatSubject}
                    onChange={(e) => setNewChatSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f1f5f9] text-[#1e293b] text-sm rounded-lg border-none outline-none placeholder:text-[#64748b] focus:ring-1 focus:ring-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Mensaje inicial (opcional)</label>
                  <textarea
                    placeholder="Cuentales por que quieres contactarlos..."
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-none px-3 py-2 bg-[#f1f5f9] text-[#1e293b] text-sm outline-none placeholder:text-[#64748b] focus:ring-1 focus:ring-[#2563eb] resize-none"
                  />
                </div>
                <Button
                  onClick={handleCreateChat}
                  disabled={!newChatSubject.trim() || creatingChat}
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg"
                >
                  {creatingChat ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {user?.role === "admin" ? "Iniciar chat" : "Enviar solicitud"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "search" && !newChatTarget && (
          <div className="flex-1 flex items-center justify-center bg-[#ffffff]">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
              <h3 className="text-lg font-medium text-[#0f172a]">Busca una empresa</h3>
              <p className="text-sm text-[#64748b] mt-1">
                Usa el buscador de la izquierda para encontrar {user?.role === "admin" ? "empresas" : user?.role === "brand" ? "fabricantes" : "marcas"}
              </p>
            </div>
          </div>
        )}

        {/* Conversacion pendiente seleccionada */}
        {tab !== "search" && selectedConv && selectedConv.status === "pending" && (
          <div className="flex-1 flex flex-col">
            {/* Pending Header */}
            <div className="h-[60px] px-4 flex items-center gap-3 bg-[#ffffff] border-b border-[#e2e8f0]">
              <div className="w-10 h-10 bg-[#f59e0b] rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getInitials(getOtherPartyName(selectedConv))}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#0f172a] text-[15px]">{getOtherPartyName(selectedConv)}</h3>
                <p className="text-xs text-[#f59e0b] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Solicitud pendiente
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-[#ffffff]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              <div className="bg-[#ffffff] rounded-xl shadow-lg border border-[#f1f5f9] p-6 text-center max-w-md">
                <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-3" />
                {isPendingForMe(selectedConv) ? (
                  <>
                    <h3 className="text-lg font-semibold text-[#0f172a] mb-1">
                      Solicitud de {selectedConv.initiator_name}
                    </h3>
                    <p className="text-sm text-[#64748b] mb-1">
                      Asunto: <span className="font-medium text-[#1e293b]">{selectedConv.subject}</span>
                    </p>
                    <p className="text-sm text-[#64748b] mb-4">
                      Deseas aceptar esta solicitud de chat?
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleRespond(selectedConv.id, "reject")}
                        className="px-4 py-2 rounded-lg text-sm bg-[#f1f5f9] text-red-400 hover:bg-[#e2e8f0] transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Rechazar
                      </button>
                      <button
                        onClick={() => handleRespond(selectedConv.id, "accept")}
                        className="px-4 py-2 rounded-lg text-sm bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Aceptar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-[#0f172a] mb-1">Solicitud enviada</h3>
                    <p className="text-sm text-[#64748b] mb-1">
                      Asunto: <span className="font-medium text-[#1e293b]">{selectedConv.subject}</span>
                    </p>
                    <p className="text-sm text-[#64748b]">
                      Esperando a que <span className="font-medium text-[#1e293b]">{getOtherPartyName(selectedConv)}</span> acepte tu solicitud.
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
            <div className="h-[60px] px-4 flex items-center justify-between bg-[#ffffff] border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getInitials(getOtherPartyName(selectedConv))}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-[#0f172a] text-[15px]">{getOtherPartyName(selectedConv)}</h3>
                  <p className="text-xs text-[#64748b]">
                    {getOtherPartyType(selectedConv)} &bull; {selectedConv.subject}
                  </p>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] transition-colors">
                <MoreVertical className="w-5 h-5 text-[#64748b]" />
              </button>
            </div>

            {/* Messages area with WhatsApp wallpaper */}
            <div
              className="flex-1 overflow-y-auto px-[6%] py-4 space-y-1"
              style={{
                backgroundColor: "#ffffff",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {messagesLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                </div>
              )}
              {!messagesLoading && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="bg-[#eff6ff] text-[#64748b] text-xs px-4 py-2 rounded-lg shadow">
                    No hay mensajes aun. Escribe el primero.
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
                      <span className="text-xs text-[#64748b] bg-[#eff6ff] px-3 py-1 rounded-lg shadow">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex justify-center py-2">
                        <span className="text-xs text-[#64748b] bg-[#eff6ff] px-3 py-1 rounded-lg shadow">
                          {new Date(msg.created_at).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-[2px]`}>
                      <div
                        className={`relative max-w-[65%] rounded-lg px-[9px] pt-1.5 pb-2 shadow ${
                          isMe
                            ? "bg-[#2563eb] text-white"
                            : "bg-[#ffffff] text-[#0f172a]"
                        }`}
                        style={isMe
                          ? { borderTopRightRadius: "0px" }
                          : { borderTopLeftRadius: "0px" }
                        }
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-[#1e40af] mb-0.5">{msg.sender_name}</p>
                        )}
                        <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap">
                          {msg.content}
                          {/* Spacer invisible to make room for timestamp */}
                          <span className="inline-block w-[58px]" />
                        </p>
                        <span className={`absolute bottom-[3px] right-[7px] text-[11px] flex items-center gap-0.5 ${
                          isMe ? "text-[#dbeafe]" : "text-[#64748b]"
                        }`}>
                          {formatTime(msg.created_at)}
                          {isMe && (
                            msg.is_read
                              ? <CheckCheck className="w-[16px] h-[16px] text-[#1d4ed8] ml-0.5" />
                              : <Check className="w-[16px] h-[16px] ml-0.5" />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar (WhatsApp style) */}
            <div className="px-3 py-2 bg-[#ffffff] flex items-end gap-2">
              <div className="flex-1 bg-[#f1f5f9] rounded-lg flex items-end">
                <input
                  placeholder="Escribe un mensaje"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent text-[#1e293b] text-sm px-3 py-[9px] outline-none border-none placeholder:text-[#64748b]"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center text-white disabled:opacity-40 disabled:hover:bg-[#2563eb] transition-colors flex-shrink-0"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {tab !== "search" && !selectedConv && (
          <div className="flex-1 flex items-center justify-center bg-[#ffffff] border-b-[6px] border-[#2563eb]">
            <div className="text-center max-w-md">
              <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-[#cbd5e1] flex items-center justify-center">
                <MessageSquare className="w-9 h-9 text-[#64748b]" />
              </div>
              <h3 className="text-[28px] font-light text-[#0f172a] mb-2">HubB Mensajes</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">
                Envia y recibe mensajes con marcas y fabricantes.
                <br />
                Selecciona una conversacion o inicia un nuevo chat.
              </p>
            </div>
          </div>
        )}

        {/* Conversation closed/archived */}
        {tab !== "search" && selectedConv && selectedConv.status !== "open" && selectedConv.status !== "pending" && (
          <div className="flex-1 flex items-center justify-center bg-[#ffffff]">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
              <h3 className="text-lg font-medium text-[#0f172a]">Conversacion cerrada</h3>
              <p className="text-sm text-[#64748b] mt-1">Esta conversacion ya no esta activa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

