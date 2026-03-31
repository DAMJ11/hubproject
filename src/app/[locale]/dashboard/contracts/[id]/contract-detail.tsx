"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import MilestoneTimeline from "./milestone-timeline";
import { formatCurrency } from "@/lib/currency";
import type { ContractDetail, Milestone } from "@/lib/data/contracts";

interface Props {
  contract: ContractDetail;
  userRole: string;
}

export default function ContractDetailClient({ contract: initial, userRole }: Props) {
  const router = useRouter();
  const t = useTranslations("ContractDetail");
  const locale = useLocale();
  const formatPrice = (amount: number) => formatCurrency(amount, locale);

  const [contract, setContract] = useState<ContractDetail>(initial);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const refreshContract = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${contract.id}`);
      const data = await res.json();
      if (data.success) setContract(data.data);
    } catch (err) {
      console.error(err);
    }
  }, [contract.id]);

  const updateMilestone = async (milestoneId: number, update: Record<string, string>) => {
    setActionLoading(milestoneId);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, ...update }),
      });
      const data = await res.json();
      if (data.success) refreshContract();
      else toast.error(t("updateError"));
    } catch (err) {
      console.error(err);
      toast.error(t("updateError"));
    } finally {
      setActionLoading(null);
    }
  };

  const completedMilestones = contract.milestones.filter((m) => m.status === "completed").length;
  const progress = contract.milestones.length > 0 ? Math.round((completedMilestones / contract.milestones.length) * 100) : 0;
  const totalPaid = contract.milestones.filter((m) => m.payment_status === "paid").reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/dashboard/contracts")} className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg" aria-label={t("back")}>
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{contract.code}</span>
            <StatusBadge entity="contracts" status={contract.status} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{contract.rfq_title}</h1>
          <p className="text-sm text-gray-500">{contract.brand_name} ↔ {contract.manufacturer_name}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("totalValue")}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(contract.total_amount)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("paid")}</p>
          <p className="text-lg font-bold text-emerald-600">{formatPrice(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("progress")}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{progress}%</p>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-1.5">
            <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("milestonesTitle")}</h2>
        <MilestoneTimeline milestones={contract.milestones} />

        {/* Action buttons per milestone */}
        {contract.status === "active" && (
          <div className="mt-4 space-y-2">
            {contract.milestones.map((m) => {
              const isManufacturer = userRole === "manufacturer";
              const isBrand = userRole === "brand";
              const hasAction =
                (isManufacturer && (m.status === "pending" || m.status === "in_progress")) ||
                (isBrand && m.status === "completed" && m.payment_status === "pending");

              if (!hasAction) return null;

              return (
                <div key={m.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{m.title}</span>
                  {isManufacturer && m.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => updateMilestone(m.id, { status: "in_progress" })} disabled={actionLoading === m.id} className="text-xs">
                      {t("startMilestone")}
                    </Button>
                  )}
                  {isManufacturer && m.status === "in_progress" && (
                    <Button size="sm" onClick={() => updateMilestone(m.id, { status: "completed" })} disabled={actionLoading === m.id} className="bg-brand-600 hover:bg-brand-700 text-white text-xs">
                      {t("markCompleted")}
                    </Button>
                  )}
                  {isBrand && m.status === "completed" && m.payment_status === "pending" && (
                    <Button size="sm" onClick={() => updateMilestone(m.id, { paymentStatus: "paid" })} disabled={actionLoading === m.id} className="bg-brand-600 hover:bg-brand-700 text-white text-xs">
                      <DollarSign className="w-3 h-3 mr-1" /> {t("registerPayment")}
                    </Button>
                  )}
                  {actionLoading === m.id && <Loader2 className="w-4 h-4 animate-spin text-brand-600" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {contract.status === "completed" && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{t("completedMessage")}</p>
        </div>
      )}
    </div>
  );
}
