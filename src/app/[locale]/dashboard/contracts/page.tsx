"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, DollarSign, CheckCircle, Circle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface ContractItem {
  id: number;
  code: string;
  rfq_title: string;
  brand_name: string;
  manufacturer_name: string;
  total_amount: number;
  status: string;
  milestones_count: number;
  milestones_completed: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function ContractsPage() {
  const router = useRouter();
  const t = useTranslations("Contracts");
  const locale = useLocale();
  const formatCOP = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();
      if (data.success) setContracts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((c) => {
            const stColor = statusColors[c.status] || statusColors.active;
            const progress = c.milestones_count > 0 ? Math.round((c.milestones_completed / c.milestones_count) * 100) : 0;

            return (
              <div key={c.id}
                onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">{c.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stColor}`}>{t(`status.${c.status}`)}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{c.rfq_title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.brand_name} ↔ {c.manufacturer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                      <DollarSign className="w-4 h-4 text-gray-400" /> {formatCOP(c.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      {progress === 100 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5" />}
                      {t("milestones", { completed: c.milestones_completed, total: c.milestones_count })}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563eb] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

