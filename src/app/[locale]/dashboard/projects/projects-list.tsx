"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/currency";
import type { RFQItem } from "@/lib/data/rfq";


export default function ProjectsList({ projects }: { projects: RFQItem[] }) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = statusFilter
    ? projects.filter((p) => p.status === statusFilter)
    : projects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("subtitle")}</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-brand-600 hover:bg-brand-700 text-white gap-2">
            <Plus className="w-4 h-4" /> {t("newProject")}
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["", "open", "evaluating", "awarded", "draft"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === value
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-brand-600"
            }`}
          >
            {t(`filters.${value || "all"}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={projects.length > 0 ? t("emptyStateFiltered") : t("emptyState")}
          action={{ label: projects.length > 0 ? t("newProject") : t("firstProject"), href: "/dashboard/projects/new" }}
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{p.code}</span>
                      <StatusBadge entity="projects" status={p.status} />
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
                    <div className="text-2xl font-bold text-brand-600">{p.proposals_count}</div>
                    <div className="text-xs text-gray-500">{t("proposals")}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
