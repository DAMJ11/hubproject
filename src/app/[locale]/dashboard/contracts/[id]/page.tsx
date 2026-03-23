"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, Circle, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

interface Milestone {
  id: number;
  title: string;
  description: string | null;
  percentage: number;
  amount: number;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  payment_status: string;
}

interface ContractDetail {
  id: number;
  code: string;
  rfq_title: string;
  rfq_code: string;
  brand_name: string;
  manufacturer_name: string;
  total_amount: number;
  status: string;
  lead_time_days: number;
  start_date: string | null;
  expected_end_date: string | null;
  created_at: string;
  milestones: Milestone[];
}

const milestoneStatusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="w-5 h-5 text-gray-300" />,
  in_progress: <Clock className="w-5 h-5 text-blue-500" />,
  completed: <CheckCircle className="w-5 h-5 text-emerald-500" />,
};

const paymentColors: Record<string, string> = {
  pending: "text-gray-500",
  invoiced: "text-yellow-600",
  paid: "text-emerald-600",
};

export default function ContractDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const t = useTranslations("ContractDetail");
  const locale = useLocale();
  const formatCOP = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [contractRes, meRes] = await Promise.all([
        fetch(`/api/contracts/${id}`),
        fetch("/api/auth/me"),
      ]);
      const contractData = await contractRes.json();
      const meData = await meRes.json();
      if (contractData.success) setContract(contractData.data);
      if (meData.success) setUserRole(meData.user.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateMilestone = async (milestoneId: number, update: Record<string, string>) => {
    setActionLoading(milestoneId);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, ...update }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d7a5f]" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/contracts")} className="mt-4">{t("back")}</Button>
      </div>
    );
  }

  const completedMilestones = contract.milestones.filter((m) => m.status === "completed").length;
  const progress = contract.milestones.length > 0 ? Math.round((completedMilestones / contract.milestones.length) * 100) : 0;
  const totalPaid = contract.milestones.filter((m) => m.payment_status === "paid").reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/dashboard/contracts")} className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{contract.code}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${contract.status === "completed" ? "bg-green-100 text-green-700" : contract.status === "active" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
              {t(`status.${contract.status}`)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{contract.rfq_title}</h1>
          <p className="text-sm text-gray-500">{contract.brand_name} ↔ {contract.manufacturer_name}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("totalValue")}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCOP(contract.total_amount)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("paid")}</p>
          <p className="text-lg font-bold text-emerald-600">{formatCOP(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("progress")}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{progress}%</p>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-1.5">
            <div className="h-full bg-[#0d7a5f] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("milestonesTitle")}</h2>
        <div className="space-y-3">
          {contract.milestones.map((m, i) => {
            const payColor = paymentColors[m.payment_status] || paymentColors.pending;
            const isManufacturer = userRole === "manufacturer";
            const isBrand = userRole === "brand";

            return (
              <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{milestoneStatusIcons[m.status] || milestoneStatusIcons.pending}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{i + 1}. {m.title}</h3>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatCOP(m.amount)}</span>
                    </div>
                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-gray-400">{t("percentOfTotal", { pct: m.percentage })}</span>
                      <span className={payColor}>{t(`paymentStatus.${m.payment_status}`)}</span>
                      {m.due_date && <span className="text-gray-400">{t("dueDate", { date: new Date(m.due_date).toLocaleDateString(locale) })}</span>}
                      {m.completed_at && <span className="text-emerald-500">{t("completedDate", { date: new Date(m.completed_at).toLocaleDateString(locale) })}</span>}
                    </div>

                    {/* Actions */}
                    {contract.status === "active" && (
                      <div className="flex gap-2 mt-3">
                        {isManufacturer && m.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => updateMilestone(m.id, { status: "in_progress" })} disabled={actionLoading === m.id}
                            className="text-xs">
                            {t("startMilestone")}
                          </Button>
                        )}
                        {isManufacturer && m.status === "in_progress" && (
                          <Button size="sm" onClick={() => updateMilestone(m.id, { status: "completed" })} disabled={actionLoading === m.id}
                            className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white text-xs">
                            {t("markCompleted")}
                          </Button>
                        )}
                        {isBrand && m.status === "completed" && m.payment_status === "pending" && (
                          <Button size="sm" onClick={() => updateMilestone(m.id, { paymentStatus: "paid" })} disabled={actionLoading === m.id}
                            className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white text-xs">
                            <DollarSign className="w-3 h-3 mr-1" /> {t("registerPayment")}
                          </Button>
                        )}
                        {actionLoading === m.id && <Loader2 className="w-4 h-4 animate-spin text-[#0d7a5f]" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
