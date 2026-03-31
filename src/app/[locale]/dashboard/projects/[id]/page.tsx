"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Package, DollarSign, Leaf, MapPin, Shield, Loader2, Check, X, Star, LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { CardSkeleton } from "@/components/shared/skeleton-loader";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/currency";

const ProposalsCompare = dynamic(() => import("./proposals-compare"), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>,
});

interface RFQDetail {
  id: number;
  code: string;
  title: string;
  description: string;
  status: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  proposals_deadline: string | null;
  proposals_count: number;
  requires_sample: boolean;
  sustainability_priority: boolean;
  preferred_materials: string | null;
  brand_name: string;
  brand_city: string | null;
  materials: { id: number; material_type: string; composition: string; recycled_percentage: number }[];
  attachments: { id: number; file_name: string; file_url: string }[];
  created_at: string;
}

interface Proposal {
  id: number;
  manufacturer_company_id: number;
  manufacturer_name: string;
  manufacturer_city: string | null;
  manufacturer_is_verified: boolean;
  unit_price: number;
  total_price: number;
  lead_time_days: number;
  proposed_materials: string | null;
  recycled_percentage: number;
  notes: string | null;
  status: string;
  green_score: number;
  distance_km: number;
  certifications_count: number;
  submitted_at: string;
}


function formatPrice(amount: number, locale: string) {
  return formatCurrency(amount, locale);
}

export default function ProjectDetailPage() {
  const t = useTranslations("ProjectDetail");
  const locale = useLocale();
  const router = useRouter();
  const { id } = useParams();
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "compare">("cards");
  const [sortKey, setSortKey] = useState<"total_price" | "lead_time_days" | "green_score" | "distance_km">("green_score");

  const fetchData = useCallback(async () => {
    try {
      const [rfqRes, proposalsRes] = await Promise.all([
        fetch(`/api/rfq/${id}`),
        fetch(`/api/rfq/${id}/proposals`),
      ]);
      const rfqData = await rfqRes.json();
      const proposalsData = await proposalsRes.json();
      if (rfqData.success) setRfq(rfqData.data);
      if (proposalsData.success) setProposals(proposalsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (proposalId: number, action: "accept" | "reject" | "shortlist") => {
    setActionLoading(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        toast.success(t("actionSuccess"));
      } else {
        toast.error(t("actionError"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("actionError"));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/projects")} className="mt-4">{t("back")}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/dashboard/projects")} className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg" aria-label={t("back")}>
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
            <StatusBadge entity="projects" status={rfq.status} />
            {rfq.sustainability_priority && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t("sustainable")}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{rfq.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rfq.category_name}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Package className="w-5 h-5" />} label={t("quantity")} value={t("units", { quantity: rfq.quantity.toLocaleString() })} />
        <InfoCard
          icon={<DollarSign className="w-5 h-5" />}
          label={t("budget")}
          value={rfq.budget_min && rfq.budget_max ? `${formatCurrency(rfq.budget_min, locale)} - ${formatCurrency(rfq.budget_max, locale)}` : t("notSpecified")}
        />
        <InfoCard icon={<Clock className="w-5 h-5" />} label={t("deadline")} value={rfq.deadline ? new Date(rfq.deadline).toLocaleDateString(locale) : t("noDeadline")} />
        <InfoCard icon={<Package className="w-5 h-5" />} label={t("proposalsLabel")} value={t("received", { count: rfq.proposals_count })} />
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t("description")}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{rfq.description}</p>
        {rfq.preferred_materials && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            <strong>{t("preferredMaterials")}</strong> {rfq.preferred_materials}
          </p>
        )}
        {rfq.requires_sample && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{t("requiresSample")}</p>}
      </div>

      {/* Materials */}
      {rfq.materials.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t("specifiedMaterials")}</h2>
          <div className="space-y-2">
            {rfq.materials.map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{m.material_type}</span>
                {m.composition && <span className="text-gray-500">· {m.composition}</span>}
                {m.recycled_percentage > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t("recycled", { percentage: m.recycled_percentage })}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("proposalsTitle", { count: proposals.length })}
          </h2>
          {proposals.length >= 2 && (
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "cards" ? "bg-white dark:bg-slate-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                aria-label={t("compare.cardsView")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("compare")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "compare" ? "bg-white dark:bg-slate-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                aria-label={t("compare.tableView")}
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {proposals.length === 0 ? (
          <EmptyState icon={Package} title={t("noProposals")} />
        ) : viewMode === "compare" ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <ProposalsCompare proposals={proposals} sortKey={sortKey} onSortChange={setSortKey} />
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const isAwarded = rfq.status === "awarded";
              return (
                <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white">{p.manufacturer_name}</span>
                        {p.manufacturer_is_verified && <Shield className="w-4 h-4 text-blue-500" />}
                        <StatusBadge entity="proposals" status={p.status} />
                      </div>
                      {p.manufacturer_city && (
                        <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" /> {p.manufacturer_city}
                          {p.distance_km > 0 && <span>· {Math.round(p.distance_km)} km</span>}
                        </p>
                      )}
                    </div>

                    {/* Green Score */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${p.green_score >= 70 ? "bg-emerald-500" : p.green_score >= 40 ? "bg-yellow-500" : "bg-red-400"}`}>
                        {p.green_score}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5"><Leaf className="w-3 h-3" /> Green</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{t("unitPrice")}</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.unit_price, locale)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{t("totalPrice")}</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.total_price, locale)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{t("leadTime")}</span>
                      <p className="font-medium text-gray-900 dark:text-white">{t("days", { days: p.lead_time_days })}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{t("certifications")}</span>
                      <p className="font-medium text-gray-900 dark:text-white">{p.certifications_count}</p>
                    </div>
                  </div>

                  {p.proposed_materials && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <strong>{t("materials")}</strong> {p.proposed_materials}
                      {p.recycled_percentage > 0 && <span className="text-emerald-600"> {t("recycledPercent", { percentage: p.recycled_percentage })}</span>}
                    </p>
                  )}
                  {p.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>{t("notes")}</strong> {p.notes}</p>}

                  <div className="mt-3">
                    <Link
                      href={`/dashboard/messages?${new URLSearchParams({
                        targetCompanyId: String(p.manufacturer_company_id),
                        rfqId: String(rfq.id),
                        subject: t("messageSubject", { code: rfq.code }),
                        message: t("messageBody", { name: p.manufacturer_name, code: rfq.code }),
                      }).toString()}`}
                    >
                      <Button size="sm" variant="outline" className="text-xs">
                        {t("contactManufacturer")}
                      </Button>
                    </Link>
                  </div>

                  {/* Actions */}
                  {!isAwarded && p.status === "submitted" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <Button size="sm" variant="outline" onClick={() => handleAction(p.id, "shortlist")} disabled={actionLoading === p.id}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Star className="w-3.5 h-3.5 mr-1" /> {t("shortlist")}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" disabled={actionLoading === p.id}
                            className="bg-brand-600 hover:bg-brand-700 text-white">
                            <Check className="w-3.5 h-3.5 mr-1" /> {t("accept")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmAccept.title")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("confirmAccept.description", { name: p.manufacturer_name })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("confirmAccept.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction(p.id, "accept")} className="bg-brand-600 hover:bg-brand-700">{t("confirmAccept.confirm")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={actionLoading === p.id}
                            className="text-red-600 border-red-200 hover:bg-red-50">
                            <X className="w-3.5 h-3.5 mr-1" /> {t("reject")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmReject.title")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("confirmReject.description", { name: p.manufacturer_name })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("confirmReject.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction(p.id, "reject")} className="bg-red-600 hover:bg-red-700">{t("confirmReject.confirm")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  {p.status === "shortlisted" && !isAwarded && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" disabled={actionLoading === p.id}
                            className="bg-brand-600 hover:bg-brand-700 text-white">
                            <Check className="w-3.5 h-3.5 mr-1" /> {t("award")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmAccept.title")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("confirmAccept.description", { name: p.manufacturer_name })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("confirmAccept.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction(p.id, "accept")} className="bg-brand-600 hover:bg-brand-700">{t("confirmAccept.confirm")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={actionLoading === p.id}
                            className="text-red-600 border-red-200 hover:bg-red-50">
                            <X className="w-3.5 h-3.5 mr-1" /> {t("reject")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmReject.title")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("confirmReject.description", { name: p.manufacturer_name })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("confirmReject.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAction(p.id, "reject")} className="bg-red-600 hover:bg-red-700">{t("confirmReject.confirm")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  {actionLoading === p.id && <Loader2 className="w-4 h-4 animate-spin text-brand-600 mt-2" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className="text-brand-600">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
