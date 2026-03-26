"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Leaf, Clock, DollarSign, Package, Settings, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { MyProposal, CapabilityOffer } from "@/lib/data/proposals";

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

export default function ProposalsList({
  proposals,
  offers,
}: {
  proposals: MyProposal[];
  offers: CapabilityOffer[];
}) {
  const t = useTranslations("Proposals");
  const locale = useLocale();
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);
  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);
  const tabs = [
    { key: "all", label: t("tabs.all") },
    { key: "pending", label: t("tabs.pending") },
    { key: "shortlisted", label: t("tabs.shortlisted") },
    { key: "accepted", label: t("tabs.accepted") },
    { key: "rejected", label: t("tabs.rejected") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <Factory className="w-4 h-4" /> {t("offersTitle")}
            </h2>
            <p className="text-xs text-blue-800 mt-1">
              {t("offersDescription")}
            </p>
          </div>
          <Link href="/dashboard/company/capabilities">
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
              <Settings className="w-4 h-4 mr-2" /> {t("manageOffer")}
            </Button>
          </Link>
        </div>

        <div className="mt-3">
          {offers.length === 0 ? (
            <p className="text-xs text-blue-700">
              {t("noCapabilities")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {offers.slice(0, 4).map((offer) => (
                <span key={offer.id} className="text-xs rounded-full bg-white/80 text-blue-900 border border-blue-200 px-2 py-1">
                  {offer.category_name}
                  {offer.unit_price_from !== null ? ` · ${t("fromPrice", { price: formatCurrencyLocal(offer.unit_price_from!) })}` : ""}
                  {offer.lead_time_days ? ` · ${offer.lead_time_days}d` : ""}
                </span>
              ))}
              {offers.length > 4 && (
                <span className="text-xs rounded-full bg-white/80 text-blue-900 border border-blue-200 px-2 py-1">
                  {t("moreCapabilities", { count: offers.length - 4 })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === t.key ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`${t("noProposals")} ${filter !== "all" ? t("noProposalsFiltered") : t("noProposalsYet")}`}
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => {
            return (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/opportunities/${p.rfq_id}`)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">{p.rfq_code}</span>
                      <StatusBadge entity="proposals" status={p.status} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.rfq_title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400"> {p.category_name}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${p.green_score >= 70 ? "bg-emerald-500" : p.green_score >= 40 ? "bg-yellow-500" : "bg-red-400"}`}>
                      {p.green_score}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5"><Leaf className="w-3 h-3" /> Green</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-400" /> {formatCurrency(p.total_price, locale)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {t("days", { days: p.lead_time_days })}</span>
                  <span className="text-xs text-gray-400">{t("submitted", { date: new Date(p.submitted_at).toLocaleDateString(locale) })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
