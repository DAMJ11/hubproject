"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Payout {
  id: number;
  amount: string;
  currency: string;
  platform_fee: string;
  net_amount: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  project_title: string | null;
  project_code: string | null;
}

interface Stats {
  total_earned: number;
  total_fees: number;
  total_net: number;
  pending_amount: number;
  completed_count: number;
}

export default function EarningsDashboardClient() {
  const t = useTranslations("DesignerEarnings");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/designer/payouts?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setPayouts(data.data || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const formatCurrency = (amount: string | number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(
      Number(amount)
    );
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("totalEarnings")}</p>
                <p className="text-lg font-bold">{formatCurrency(stats.total_earned, "USD")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("pendingPayouts")}</p>
                <p className="text-lg font-bold">{formatCurrency(stats.pending_amount, "USD")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("completedPayouts")}</p>
                <p className="text-lg font-bold">{stats.completed_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("netAmount")}</p>
                <p className="text-lg font-bold">{formatCurrency(stats.total_net, "USD")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payouts table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t("noPayouts")}</p>
              <p className="text-muted-foreground">{t("noPayoutsDesc")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">{t("project")}</th>
                      <th className="pb-2 font-medium">{t("amount")}</th>
                      <th className="pb-2 font-medium">{t("platformFee")}</th>
                      <th className="pb-2 font-medium">{t("netAmount")}</th>
                      <th className="pb-2 font-medium">{t("status")}</th>
                      <th className="pb-2 font-medium">{t("date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3">
                          <span className="font-medium">{p.project_title || p.project_code || "-"}</span>
                        </td>
                        <td className="py-3">{formatCurrency(p.amount, p.currency)}</td>
                        <td className="py-3 text-muted-foreground">
                          {formatCurrency(p.platform_fee, p.currency)}
                        </td>
                        <td className="py-3 font-medium">{formatCurrency(p.net_amount, p.currency)}</td>
                        <td className="py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              STATUS_COLORS[p.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {t(`status_${p.status}`)}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(p.paid_at || p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
