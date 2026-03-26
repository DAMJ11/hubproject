"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Search, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { RFQItem } from "@/lib/data/rfq";

function formatCurrency(n: number | null, locale: string) {
  if (n === null) return "—";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export default function RfqList({ rfqs, initialStatus }: { rfqs: RFQItem[]; initialStatus: string }) {
  const t = useTranslations("RFQ");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const statusFilter = searchParams.get("status") ?? initialStatus;

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  const filtered = rfqs.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

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
          onChange={(e) => handleStatusChange(e.target.value)}
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

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title={t("noResults")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((rfq) => {
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
                      <StatusBadge entity="projects" status={rfq.status} />
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
