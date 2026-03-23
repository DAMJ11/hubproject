"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, Search, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RFQItem {
  id: number;
  code: string;
  title: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  proposals_count: number;
  sustainability_priority: boolean;
  brand_name: string;
  brand_city: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-100 text-gray-700", icon: FileText },
  open: { color: "bg-blue-100 text-blue-700", icon: Clock },
  evaluating: { color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  awarded: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-700", icon: AlertCircle },
  expired: { color: "bg-gray-100 text-gray-500", icon: Clock },
};

function formatCurrency(n: number | null, locale: string) {
  if (n === null) return "—";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export default function AdminRFQPage() {
  const t = useTranslations("RFQ");
  const locale = useLocale();
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchRFQs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/rfq?${params}`);
      const data = await res.json();
      if (data.success) setRfqs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRFQs();
  }, [fetchRFQs]);

  const filtered = rfqs.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="draft">{t("statusFilter.draft")}</option>
          <option value="open">{t("statusFilter.open")}</option>
          <option value="evaluating">{t("statusFilter.evaluating")}</option>
          <option value="awarded">{t("statusFilter.awarded")}</option>
          <option value="cancelled">{t("statusFilter.cancelled")}</option>
          <option value="expired">{t("statusFilter.expired")}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsTotal")}</p>
          <p className="text-2xl font-bold">{rfqs.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsOpen")}</p>
          <p className="text-2xl font-bold text-blue-600">{rfqs.filter(r => r.status === "open").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsEvaluating")}</p>
          <p className="text-2xl font-bold text-yellow-600">{rfqs.filter(r => r.status === "evaluating").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsAwarded")}</p>
          <p className="text-2xl font-bold text-green-600">{rfqs.filter(r => r.status === "awarded").length}</p>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t("noResults")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rfq) => {
            const badge = statusConfig[rfq.status] || statusConfig.draft;
            const StatusIcon = badge.icon;
            return (
              <Link
                key={rfq.id}
                href={`/dashboard/projects/${rfq.id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${badge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {t(`status.${rfq.status}`)}
                      </span>
                      {rfq.sustainability_priority && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          {t("eco")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{rfq.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {rfq.brand_name} · {rfq.category_name} · {t("units", { quantity: rfq.quantity })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t("budget")}</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(rfq.budget_min, locale)} – {formatCurrency(rfq.budget_max, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t("proposals")}</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">{rfq.proposals_count}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

