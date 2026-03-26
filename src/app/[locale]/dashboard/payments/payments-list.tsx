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

  const formatCOP = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

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
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("totalRevenue")}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(totals.total_revenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("pending")}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(totals.pending_amount)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("transactions")}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totals.total_transactions}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("successRate")}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{successRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
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
                <TableHead>{t("table.code")}</TableHead>
                <TableHead>{t("table.client")}</TableHead>
                <TableHead>{t("table.service")}</TableHead>
                <TableHead>{t("table.amount")}</TableHead>
                <TableHead>{t("table.method")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
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
                  <TableCell className="text-sm text-gray-700">{p.payer_name}</TableCell>
                  <TableCell className="text-sm text-gray-700">{p.payee_name}</TableCell>
                  <TableCell className="text-sm font-semibold text-gray-900">{formatCOP(p.amount)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{p.payment_method}</TableCell>
                  <TableCell>
                    <StatusBadge entity="payments" status={p.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{p.paid_at ? new Date(p.paid_at).toLocaleDateString(locale) : new Date(p.created_at).toLocaleDateString(locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
