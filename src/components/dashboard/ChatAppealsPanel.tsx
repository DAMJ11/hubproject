"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface Appeal {
  id: number;
  user_id: number;
  conversation_id: number;
  appeal_text: string;
  status: "pending" | "approved" | "rejected";
  admin_user_id: number | null;
  resolved_at: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
  conversation_subject: string | null;
  violation_count: number;
  flagged_messages: string[];
}

export default function ChatAppealsPanel() {
  const t = useTranslations("ChatAppeals");
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);

  const loadAppeals = useCallback(async () => {
    try {
      const url = filter === "all"
        ? "/api/chat-appeals"
        : `/api/chat-appeals?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAppeals(data.appeals ?? []);
      }
    } catch (e) {
      console.error("Error loading appeals:", e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadAppeals();
  }, [loadAppeals]);

  const handleResolve = async (appealId: number, decision: "approved" | "rejected") => {
    setResolving(appealId);
    try {
      const res = await fetch("/api/chat-appeals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appealId, decision }),
      });
      const data = await res.json();
      if (data.success) {
        await loadAppeals();
        setExpandedId(null);
      }
    } catch (e) {
      console.error("Error resolving appeal:", e);
    } finally {
      setResolving(null);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
        </div>
        <div className="flex gap-1">
          {(["pending", "all", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                filter === f
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {f === "all" ? "All" : t(f)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">{t("subtitle")}</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Appeal header row */}
              <button
                onClick={() => setExpandedId(expandedId === appeal.id ? null : appeal.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(appeal.status)}`}>
                    {statusIcon(appeal.status)}
                    {t(appeal.status)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{appeal.user_name}</p>
                    <p className="text-xs text-gray-400 truncate">{appeal.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">
                      {t("violations")}: <span className="text-red-400 font-medium">{appeal.violation_count}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(appeal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedId === appeal.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === appeal.id && (
                <div className="border-t border-gray-700 px-4 py-4 bg-gray-800/50 space-y-4">
                  {/* Conversation */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">{t("conversation")}</p>
                    <p className="text-sm text-white">{appeal.conversation_subject || `#${appeal.conversation_id}`}</p>
                  </div>

                  {/* User appeal text */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">{t("appealText")}</p>
                    <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300 leading-relaxed">
                      {appeal.appeal_text}
                    </div>
                  </div>

                  {/* Flagged messages */}
                  {appeal.flagged_messages.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                        {t("flaggedMessages")} ({appeal.flagged_messages.length})
                      </p>
                      <div className="space-y-1.5">
                        {appeal.flagged_messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className="bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 text-sm text-red-300"
                          >
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions (only for pending) */}
                  {appeal.status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t border-gray-700">
                      <button
                        onClick={() => handleResolve(appeal.id, "approved")}
                        disabled={resolving === appeal.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {resolving === appeal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {t("approve")}
                      </button>
                      <button
                        onClick={() => handleResolve(appeal.id, "rejected")}
                        disabled={resolving === appeal.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {resolving === appeal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {t("reject")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
