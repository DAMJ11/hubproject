import { FileText, DollarSign, CheckCircle, Circle } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Progress } from "@/components/ui/progress";
import { getContracts } from "@/lib/data/contracts";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/currency";

export default async function ContractsPage() {
  const contracts = await getContracts();
  if (!contracts) redirect("/login");

  const t = await getTranslations("Contracts");
  const locale = await getLocale();
  const formatPrice = (amount: number) => formatCurrency(amount, locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      {contracts.length === 0 ? (
        <EmptyState icon={FileText} title={t("empty")} />
      ) : (
        <div className="grid gap-4">
          {contracts.map((c) => {
            const progress = c.milestones_count > 0 ? Math.round((c.milestones_completed / c.milestones_count) * 100) : 0;

            return (
              <Link key={c.id} href={`/dashboard/contracts/${c.id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">{c.code}</span>
                      <StatusBadge entity="contracts" status={c.status} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{c.rfq_title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.brand_name} ↔ {c.manufacturer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                      <DollarSign className="w-4 h-4 text-gray-400" /> {formatPrice(c.total_amount)}
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
                  <div className="h-2 rounded-full overflow-hidden">
                    <Progress value={progress} className="h-2" />
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

