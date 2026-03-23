"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Package, Clock, DollarSign, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RFQDetail {
  id: number;
  brand_company_id: number;
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
  requires_sample: boolean;
  sustainability_priority: boolean;
  preferred_materials: string | null;
  brand_name: string;
  brand_city: string | null;
  materials: { id: number; material_type: string; composition: string; recycled_percentage: number }[];
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const t = useTranslations("OpportunityDetail");
  const locale = useLocale();
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    unitPrice: "",
    leadTimeDays: "",
    proposedMaterials: "",
    recycledPercentage: "0",
    notes: "",
  });

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  const fetchRfq = useCallback(async () => {
    try {
      const res = await fetch(`/api/rfq/${id}`);
      const data = await res.json();
      if (data.success) setRfq(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRfq(); }, [fetchRfq]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unitPrice || !form.leadTimeDays) {
      setError(t("validationError"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/rfq/${id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitPrice: Number(form.unitPrice),
          leadTimeDays: Number(form.leadTimeDays),
          proposedMaterials: form.proposedMaterials || undefined,
          recycledPercentage: Number(form.recycledPercentage),
          notes: form.notes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || t("submitError"));
      }
    } catch {
      setError(t("connectionError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d7a5f]" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/opportunities")} className="mt-4">{t("back")}</Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <Leaf className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("submitted.title")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t("submitted.description")}</p>
        <Button onClick={() => router.push("/dashboard/proposals")} className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
          {t("submitted.viewProposals")}
        </Button>
      </div>
    );
  }

  const inputClass = "h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-[#0d7a5f] focus:ring-[#0d7a5f]";
  const contactBrandParams = new URLSearchParams({
    targetCompanyId: String(rfq.brand_company_id),
    rfqId: String(rfq.id),
    subject: t("contactSubject", { code: rfq.code }),
    message: t("contactMessage", { code: rfq.code, title: rfq.title }),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <button onClick={() => router.back()} className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
            {rfq.sustainability_priority && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t("sustainablePriority")}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{rfq.title}</h1>
          <p className="text-sm text-gray-500">{rfq.category_name} · {rfq.brand_name}{rfq.brand_city ? ` · ${rfq.brand_city}` : ""}</p>
        </div>
      </div>

      {/* Project info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{rfq.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Package className="w-4 h-4 text-gray-400" /> {t("units", { count: rfq.quantity.toLocaleString() })}</span>
          {rfq.budget_min && rfq.budget_max && (
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><DollarSign className="w-4 h-4 text-gray-400" /> {formatCOP(rfq.budget_min)} - {formatCOP(rfq.budget_max)}</span>
          )}
          {rfq.deadline && (
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Clock className="w-4 h-4 text-gray-400" /> {t("delivery", { date: new Date(rfq.deadline).toLocaleDateString(locale) })}</span>
          )}
        </div>
        {rfq.preferred_materials && <p className="text-xs text-gray-500"><strong>{t("preferredMaterials")}</strong> {rfq.preferred_materials}</p>}
        {rfq.requires_sample && <p className="text-xs text-amber-600">{t("requiresSample")}</p>}

        {rfq.materials.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t("specifiedMaterials")}</p>
            {rfq.materials.map((m) => (
              <p key={m.id} className="text-xs text-gray-500">{m.material_type} {m.composition && `· ${m.composition}`}{m.recycled_percentage > 0 && ` · ${t("recycled", { percentage: m.recycled_percentage })}`}</p>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
          <Link href={`/dashboard/messages?${contactBrandParams.toString()}`}>
            <Button type="button" variant="outline" className="w-full">
              {t("contactBrand")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Proposal form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("proposalTitle")}</h2>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("unitPriceLabel")}</label>
            <Input name="unitPrice" type="number" min="1" value={form.unitPrice} onChange={handleChange} placeholder="15000" className={inputClass} required />
            {form.unitPrice && rfq.quantity && (
              <p className="text-xs text-gray-400 mt-1">{t("total", { amount: formatCOP(Number(form.unitPrice) * rfq.quantity) })}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("leadTimeLabel")}</label>
            <Input name="leadTimeDays" type="number" min="1" value={form.leadTimeDays} onChange={handleChange} placeholder="30" className={inputClass} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("proposedMaterialsLabel")}</label>
          <Input name="proposedMaterials" value={form.proposedMaterials} onChange={handleChange} placeholder={t("proposedMaterialsPlaceholder")} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("recycledPercentageLabel")}</label>
          <Input name="recycledPercentage" type="number" min="0" max="100" value={form.recycledPercentage} onChange={handleChange} className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">{t("recycledPercentageHint")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("notesLabel")}</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder={t("notesPlaceholder")} className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 focus:border-[#0d7a5f] focus:ring-[#0d7a5f]" />
        </div>

        <Button type="submit" className="w-full bg-[#0d7a5f] hover:bg-[#0a6b52] text-white h-11" disabled={submitting}>
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("submitting")}</> : t("submitProposal")}
        </Button>
      </form>
    </div>
  );
}
