"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Search, DollarSign, TrendingUp, Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { PaymentItem, PaymentTotals } from "@/lib/data/payments";
import { formatCurrency } from "@/lib/currency";

interface PaymentsListProps {
  payments: PaymentItem[];
  totals: PaymentTotals;
}

export default function PaymentsList({ payments, totals }: PaymentsListProps) {
  const t = useTranslations("Payments");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const filterStatus = searchParams.get("status") ?? "all";

  const updateParams = (key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== defaultValue) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const setSearchQuery = (v: string) => updateParams("q", v, "");
  const setFilterStatus = (v: string) => updateParams("status", v, "all");

  const formatPrice = (n: number) => formatCurrency(n, locale);

  const successRate = totals.total_transactions > 0
    ? Math.round((totals.completed_count / totals.total_transactions) * 100)
    : 0;

  const filtered = payments.filter((p) => {
    const matchSearch = `${p.contract_code} ${p.payer_name} ${p.payee_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-500 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t("totalRevenue")}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totals.total_revenue)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-200">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t("pending")}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totals.pending_amount)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-200">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t("transactions")}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totals.total_transactions}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-200">
              <CreditCard className="h-5 w-5 text-sky-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t("successRate")}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{successRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-200">
              <TrendingUp className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input defaultValue={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "completed", "pending", "failed", "refunded"].map((s) => (
            <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? "bg-brand-600 hover:bg-brand-700" : ""}>
              {s === "all" ? t("allFilter") : t(`status.${s}`)}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-slate-800">
                <TableHead className="whitespace-nowrap">{t("table.code")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("table.client")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("table.service")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("table.amount")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("table.method")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("table.status")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("table.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={CreditCard}
                      title={payments.length === 0 ? t("emptyNoPayments") : t("emptyNoResults")}
                      description={payments.length === 0 ? t("emptyHint") : t("filterHint")}
                      action={(searchQuery || filterStatus !== "all") ? {
                        label: t("clearFilters"),
                        onClick: () => {
                          const newParams = new URLSearchParams();
                          router.push(`?${newParams.toString()}`);
                        },
                      } : undefined}
                    />
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm font-medium text-brand-600">{p.contract_code}</TableCell>
                  <TableCell className="text-sm text-gray-700 dark:text-slate-200">{p.payer_name}</TableCell>
                  <TableCell className="text-sm text-gray-700 dark:text-slate-200">{p.payee_name}</TableCell>
                  <TableCell className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(p.amount)}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-slate-300">{p.payment_method}</TableCell>
                  <TableCell>
                    <StatusBadge entity="payments" status={p.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-slate-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString(locale) : new Date(p.created_at).toLocaleDateString(locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
