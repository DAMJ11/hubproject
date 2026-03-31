"use client";

import { useTranslations, useLocale } from "next-intl";
import { CheckCircle, Circle, Clock, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";

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

const statusConfig = {
  pending: { color: "bg-gray-300 dark:bg-slate-600", ring: "ring-gray-200 dark:ring-slate-700", icon: Circle, iconColor: "text-gray-400" },
  in_progress: { color: "bg-brand-600", ring: "ring-brand-100 dark:ring-brand-900", icon: Clock, iconColor: "text-brand-600" },
  completed: { color: "bg-emerald-500", ring: "ring-emerald-100 dark:ring-emerald-900", icon: CheckCircle, iconColor: "text-emerald-500" },
} as const;

const paymentBadge: Record<string, string> = {
  pending: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400",
  invoiced: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  paid: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};

export default function MilestoneTimeline({
  milestones,
  locale: localeProp,
}: {
  milestones: Milestone[];
  locale?: string;
}) {
  const t = useTranslations("ContractDetail");
  const intlLocale = useLocale();
  const locale = localeProp ?? intlLocale;

  const fmt = (amount: number) => formatCurrency(amount, locale);

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1 h-2" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
          {completedCount}/{milestones.length}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {milestones.map((m, i) => {
          const cfg = statusConfig[m.status as keyof typeof statusConfig] ?? statusConfig.pending;
          const Icon = cfg.icon;
          const isLast = i === milestones.length - 1;

          return (
            <div key={m.id} className="relative flex gap-4 pb-6">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-10 w-0.5 bottom-0 ${
                    m.status === "completed"
                      ? "bg-emerald-300 dark:bg-emerald-700"
                      : "bg-gray-200 dark:bg-slate-700"
                  }`}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ring-4 ${cfg.ring} ${cfg.color} flex-shrink-0 mt-0.5`}
              >
                <Icon className={`w-4 h-4 ${m.status === "completed" ? "text-white" : m.status === "in_progress" ? "text-white" : cfg.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {i + 1}. {m.title}
                    </p>
                    {m.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {m.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {fmt(m.amount)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">
                    {t("percentOfTotal", { pct: m.percentage })}
                  </span>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      paymentBadge[m.payment_status] ?? paymentBadge.pending
                    }`}
                  >
                    <DollarSign className="w-3 h-3 inline mr-0.5" />
                    {t(`paymentStatus.${m.payment_status}`)}
                  </span>

                  {m.due_date && (
                    <span className="text-xs text-gray-400">
                      {t("dueDate", {
                        date: new Date(m.due_date).toLocaleDateString(locale),
                      })}
                    </span>
                  )}
                  {m.completed_at && (
                    <span className="text-xs text-emerald-500">
                      ✓{" "}
                      {t("completedDate", {
                        date: new Date(m.completed_at).toLocaleDateString(locale),
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
