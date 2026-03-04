"use client";

import { useState } from "react";
import {
  Send,
  Paperclip,
  Search,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Star,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  sender: "user" | "other" | "system";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  person: {
    name: string;
    initials: string;
    role: string;
    isOnline: boolean;
    rating?: number;
  };
  service: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    person: { name: "Carlos Méndez", initials: "CM", role: "Profesional - Limpieza", isOnline: true, rating: 4.9 },
    service: "Limpieza Profunda",
    lastMessage: "Perfecto, llego a las 10:00 AM",
    timestamp: new Date(),
    unread: 2,
    messages: [
      { id: "m1", content: "Hola Carlos, necesito una limpieza profunda para mañana.", sender: "user", timestamp: new Date(Date.now() - 3600000 * 2), status: "read" },
      { id: "m2", content: "¡Hola! Claro, ¿qué tamaño es su apartamento?", sender: "other", timestamp: new Date(Date.now() - 3600000) },
      { id: "m3", content: "Es de 3 habitaciones, 2 baños y cocina.", sender: "user", timestamp: new Date(Date.now() - 1800000), status: "read" },
      { id: "m4", content: "Perfecto, llego a las 10:00 AM. El servicio tomará unas 5 horas.", sender: "other", timestamp: new Date(Date.now() - 600000) },
    ],
  },
  {
    id: "2",
    person: { name: "Ana Ruiz", initials: "AR", role: "Profesional - Jardinería", isOnline: false, rating: 4.7 },
    service: "Poda de Jardín",
    lastMessage: "El presupuesto incluye los materiales",
    timestamp: new Date(Date.now() - 7200000),
    unread: 0,
    messages: [
      { id: "m5", content: "Hola Ana, necesito que poden el jardín trasero.", sender: "user", timestamp: new Date(Date.now() - 86400000), status: "read" },
      { id: "m6", content: "¡Hola! ¿Puede enviarme fotos del jardín?", sender: "other", timestamp: new Date(Date.now() - 80000000) },
      { id: "m7", content: "El presupuesto incluye los materiales y la limpieza final.", sender: "other", timestamp: new Date(Date.now() - 7200000) },
    ],
  },
  {
    id: "3",
    person: { name: "Miguel Torres", initials: "MT", role: "Profesional - Electricidad", isOnline: true, rating: 4.8 },
    service: "Revisión Eléctrica",
    lastMessage: "Reserva confirmada para el miércoles",
    timestamp: new Date(Date.now() - 86400000),
    unread: 1,
    messages: [
      { id: "m8", content: "Buenas tardes, necesito una revisión eléctrica completa.", sender: "user", timestamp: new Date(Date.now() - 172800000), status: "read" },
      { id: "m9", content: "Reserva confirmada para el miércoles a las 9:00 AM. Le enviaré un reporte detallado al finalizar.", sender: "other", timestamp: new Date(Date.now() - 86400000) },
    ],
  },
];

export default function MessagesPanel() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(
    (c) =>
      c.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setNewMessage("");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
                selectedConversation?.id === conv.id ? "bg-[#0d7a5f]/5 border-l-2 border-l-[#0d7a5f]" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-[#0d7a5f] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{conv.person.initials}</span>
                </div>
                {conv.person.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900 truncate">{conv.person.name}</span>
                  <span className="text-xs text-gray-400">{formatTime(conv.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{conv.service}</p>
                <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-[#0d7a5f] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#0d7a5f] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{selectedConversation.person.initials}</span>
                </div>
                {selectedConversation.person.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{selectedConversation.person.name}</h3>
                  {selectedConversation.person.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-gray-600">{selectedConversation.person.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{selectedConversation.person.role} • {selectedConversation.service}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Phone className="w-4 h-4 text-gray-500" /></Button>
              <Button variant="ghost" size="icon"><Video className="w-4 h-4 text-gray-500" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4 text-gray-500" /></Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender === "user"
                      ? "bg-[#0d7a5f] text-white"
                      : msg.sender === "system"
                      ? "bg-gray-200 text-gray-600 text-center text-sm"
                      : "bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    msg.sender === "user" ? "text-white/70" : "text-gray-400"
                  }`}>
                    <span className="text-xs">{formatTime(msg.timestamp)}</span>
                    {msg.sender === "user" && msg.status === "read" && <CheckCheck className="w-3 h-3" />}
                    {msg.sender === "user" && msg.status === "delivered" && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </Button>
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Selecciona una conversación</h3>
            <p className="text-sm text-gray-500 mt-1">Elige una conversación para empezar a chatear</p>
          </div>
        </div>
      )}
    </div>
  );
}
