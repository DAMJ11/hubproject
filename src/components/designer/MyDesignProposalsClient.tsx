"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send, Clock, DollarSign, Building2, XCircle, ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface MyProposal {
  id: number;
  price: string;
  estimated_days: number;
  concept_notes: string | null;
  status: string;
  submitted_at: string;
  responded_at: string | null;
  project_id: number;
  project_code: string;
  project_title: string;
  project_category: string;
  project_status: string;
  budget_min: string | null;
  budget_max: string | null;
  project_currency: string;
  project_deadline: string | null;
  brand_name: string;
  brand_logo: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  shortlisted: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

export default function MyDesignProposalsClient() {
  const t = useTranslations("DesignMyProposals");
  const [proposals, setProposals] = useState<MyProposal[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(pagination.page));

      const res = await fetch(`/api/designer/proposals?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProposals(json.data || []);
        setPagination(json.pagination);
      }
    } catch {
      toast.error(t("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page, t]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleWithdraw = async (proposalId: number) => {
    if (!confirm(t("confirmWithdraw"))) return;
    try {
      const res = await fetch(`/api/designer/proposals?proposalId=${proposalId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(t("withdrawn"));
        fetchProposals();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorWithdrawing"));
    }
  };

  const statuses = ["", "submitted", "shortlisted", "accepted", "rejected", "withdrawn"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Send className="h-6 w-6 text-amber-600" />
        {t("title")}
      </h1>

      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s ? t(`status.${s}`) : t("allStatuses")}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">{t("loading")}</div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("noProposals")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <Card key={prop.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{prop.project_code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[prop.status] || "bg-gray-100"}`}>
                        {t(`status.${prop.status}`)}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{prop.project_title}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {prop.brand_name}
                    </p>
                  </div>
                  {(prop.status === "submitted" || prop.status === "shortlisted") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300"
                      onClick={() => handleWithdraw(prop.id)}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      {t("withdraw")}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">
                      {Number(prop.price).toLocaleString()} {prop.project_currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {prop.estimated_days} {t("days")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("submittedOn")} {new Date(prop.submitted_at).toLocaleDateString()}
                  </div>
                  {prop.responded_at && (
                    <div className="text-xs">
                      {t("respondedOn")} {new Date(prop.responded_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {prop.concept_notes && (
                  <p className="text-sm text-muted-foreground mt-2 bg-slate-50 p-2 rounded line-clamp-2">
                    {prop.concept_notes}
                  </p>
                )}
                {prop.status === "accepted" && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-medium">
                    🎉 {t("acceptedMessage")}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
