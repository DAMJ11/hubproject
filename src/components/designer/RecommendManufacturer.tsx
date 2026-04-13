"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Search, Loader2, Factory, BadgeCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Manufacturer {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  logo_url: string | null;
  is_verified: boolean;
  completed_contracts: number;
}

interface RecommendManufacturerProps {
  projectId: number;
  onConversationCreated?: (conversationId: number) => void;
}

export default function RecommendManufacturer({ projectId, onConversationCreated }: RecommendManufacturerProps) {
  const t = useTranslations("DesignTrilateral");
  const [search, setSearch] = useState("");
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMfg, setSelectedMfg] = useState<Manufacturer | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchManufacturers = useCallback(async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/design-projects/${projectId}/recommend-manufacturer?q=${encodeURIComponent(search)}&limit=10`
      );
      const data = await res.json();
      if (data.success) {
        setManufacturers(data.data || []);
      }
    } catch {
      toast.error(t("searchError"));
    } finally {
      setLoading(false);
    }
  }, [projectId, search, t]);

  const handleRecommend = async () => {
    if (!selectedMfg) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/design-projects/${projectId}/recommend-manufacturer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manufacturerCompanyId: selectedMfg.id,
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("recommended"));
        onConversationCreated?.(data.data.conversationId);
        setSelectedMfg(null);
        setReason("");
        setManufacturers([]);
        setSearch("");
      } else {
        toast.error(data.message || t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Factory className="w-5 h-5 text-amber-600" />
          {t("recommendManufacturer")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("recommendDesc")}</p>

        {!selectedMfg ? (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchManufacturer")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchManufacturers()}
                  className="pl-10"
                />
              </div>
              <Button onClick={searchManufacturers} disabled={loading} variant="outline">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("search")}
              </Button>
            </div>

            {manufacturers.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {manufacturers.map((mfg) => (
                  <button
                    key={mfg.id}
                    onClick={() => setSelectedMfg(mfg)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    {mfg.logo_url ? (
                      <img src={mfg.logo_url} alt={mfg.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Factory className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 font-medium text-sm">
                        {mfg.name}
                        {mfg.is_verified && <BadgeCheck className="w-3 h-3 text-blue-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[mfg.city, mfg.country].filter(Boolean).join(", ")}
                        {mfg.completed_contracts > 0 && ` · ${mfg.completed_contracts} ${t("completedContracts")}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Factory className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">{selectedMfg.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[selectedMfg.city, selectedMfg.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setSelectedMfg(null)}
              >
                {t("change")}
              </Button>
            </div>

            <Textarea
              placeholder={t("reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />

            <Button
              onClick={handleRecommend}
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              {submitting ? t("recommending") : t("recommend")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
