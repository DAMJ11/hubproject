"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ProjectsPage() {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const [projects, setProjects] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/rfq?${params}`);
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("subtitle")}</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2">
            <Plus className="w-4 h-4" /> {t("newProject")}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["" , "open", "evaluating", "awarded", "draft"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === value
                ? "bg-[#2563eb] text-white border-[#2563eb]"
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-[#2563eb]"
            }`}
          >
            {t(`filters.${value || "all"}`)}
          </button>
        ))}

      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t("emptyState")}</p>
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2">
              <Plus className="w-4 h-4" /> {t("firstProject")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => {
            const st = statusConfig[p.status] || statusConfig.draft;
            const StIcon = st.icon;
            return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{p.code}</span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          <StIcon className="w-3 h-3" /> {t(`status.${p.status}`)}
                        </span>
                        {p.sustainability_priority && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{t("sustainable")}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📦 {t("units", { quantity: p.quantity })}</span>
                        <span>📂 {p.category_name}</span>
                        {p.deadline && <span>{t("delivery", { date: new Date(p.deadline).toLocaleDateString(locale) })}</span>}
                        {p.budget_max && <span>💰 {formatCurrency(p.budget_min, locale)} - {formatCurrency(p.budget_max, locale)}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-[#2563eb]">{p.proposals_count}</div>
                      <div className="text-xs text-gray-500">{t("proposals")}</div>
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

