"use client";

import { useState } from "react";
import { MessageCircle, Send, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { useTranslations } from "next-intl";

export default function LiveChatWidget() {
  const { user } = useDashboardUser();
  const t = useTranslations("LiveChatWidget");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportRequest: true,
          subject: subject.trim(),
          initialMessage: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("errors.createFailed"));
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setSubject("");
      setMessage("");

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch {
      setError(t("errors.network"));
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          data-live-chat-trigger
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">{t("trigger")}</span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/30">
          <div className="w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{t("title")}</h2>
                <p className="text-indigo-100 text-sm">{t("subtitle")}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-indigo-500 rounded transition"
                aria-label={t("close")}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-3">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-bold text-green-700 mb-1">{t("success.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("success.description")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("subjectLabel")}
                    </label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t("subjectPlaceholder")}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("messageLabel")}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("messagePlaceholder")}
                      required
                      disabled={isLoading}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !subject.trim() || !message.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        {t("submit")}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
