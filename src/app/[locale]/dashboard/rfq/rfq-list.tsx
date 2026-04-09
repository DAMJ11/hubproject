"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Search, Leaf, Plus, Building2, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import type { RFQItem } from "@/lib/data/rfq";

import { formatCurrency } from "@/lib/currency";

export default function RfqList({ rfqs, initialStatus, userRole }: { rfqs: RFQItem[]; initialStatus: string; userRole: string }) {
  const t = useTranslations("RFQ");
  const tAdmin = useTranslations("AdminCreateRFQ");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  // Admin create RFQ state
  const [showCreate, setShowCreate] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandResults, setBrandResults] = useState<Array<{ id: number; name: string; city: string | null }>>([]);
  const [brandSearching, setBrandSearching] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{ id: number; name: string } | null>(null);
  const [createForm, setCreateForm] = useState({ title: "", description: "", quantity: "", categoryId: "", budgetMin: "", budgetMax: "", deadline: "" });
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [creating, setCreating] = useState(false);

  const searchBrands = async (q: string) => {
    if (q.length < 2) { setBrandResults([]); return; }
    setBrandSearching(true);
    try {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}&type=brand&limit=5`);
      const data = await res.json();
      if (data.success) setBrandResults(data.companies ?? data.data ?? []);
    } catch { /* silent */ }
    finally { setBrandSearching(false); }
  };

  const loadCategories = async () => {
    if (categories.length > 0) return;
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data ?? []);
    } catch { /* silent */ }
  };

  const handleCreateRfq = async () => {
    if (!selectedBrand || !createForm.title || !createForm.description || !createForm.quantity || !createForm.categoryId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandCompanyId: selectedBrand.id,
          title: createForm.title,
          description: createForm.description,
          quantity: Number(createForm.quantity),
          categoryId: Number(createForm.categoryId),
          budgetMin: createForm.budgetMin ? Number(createForm.budgetMin) : undefined,
          budgetMax: createForm.budgetMax ? Number(createForm.budgetMax) : undefined,
          deadline: createForm.deadline || undefined,
          projectType: ["production_only"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(tAdmin("created"));
        setShowCreate(false);
        router.refresh();
      } else {
        toast.error(data.message || tAdmin("error"));
      }
    } catch {
      toast.error(tAdmin("error"));
    } finally {
      setCreating(false);
    }
  };

  const statusFilter = searchParams.get("status") ?? initialStatus;

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  const filtered = rfqs.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setShowCreate(!showCreate); loadCategories(); }} variant={showCreate ? "outline" : "default"} size="sm">
            {showCreate ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showCreate ? tAdmin("close") : tAdmin("createForBrand")}
          </Button>
        )}
      </div>

      {/* Admin Create RFQ Form */}
      {isAdmin && showCreate && (
        <Card className="p-6 space-y-4 border-blue-200 dark:border-blue-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{tAdmin("formTitle")}</h2>

          {/* Brand selector */}
          {!selectedBrand ? (
            <div className="space-y-2">
              <label className="text-xs text-gray-500">{tAdmin("selectBrand")}</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input placeholder={tAdmin("searchBrand")} value={brandSearch} onChange={(e) => { setBrandSearch(e.target.value); searchBrands(e.target.value); }} className="pl-9" />
              </div>
              {brandSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />}
              {brandResults.length > 0 && (
                <div className="border dark:border-slate-700 rounded-lg divide-y dark:divide-slate-700 max-h-32 overflow-y-auto">
                  {brandResults.map((b) => (
                    <button key={b.id} onClick={() => { setSelectedBrand({ id: b.id, name: b.name }); setBrandResults([]); setBrandSearch(""); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" /> {b.name} {b.city && <span className="text-xs text-gray-400">({b.city})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{selectedBrand.name}</span>
              <button onClick={() => setSelectedBrand(null)} className="ml-auto text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("titleField")}</label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("category")}</label>
              <select value={createForm.categoryId} onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700">
                <option value="">{tAdmin("selectCategory")}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("description")}</label>
              <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("quantity")}</label>
              <Input type="number" value={createForm.quantity} onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("deadline")}</label>
              <Input type="date" value={createForm.deadline} onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("budgetMin")}</label>
              <Input type="number" value={createForm.budgetMin} onChange={(e) => setCreateForm({ ...createForm, budgetMin: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{tAdmin("budgetMax")}</label>
              <Input type="number" value={createForm.budgetMax} onChange={(e) => setCreateForm({ ...createForm, budgetMax: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateRfq} disabled={creating || !selectedBrand || !createForm.title || !createForm.description || !createForm.quantity || !createForm.categoryId}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {tAdmin("create")}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="draft">{t("statusFilter.draft")}</option>
          <option value="open">{t("statusFilter.open")}</option>
          <option value="evaluating">{t("statusFilter.evaluating")}</option>
          <option value="awarded">{t("statusFilter.awarded")}</option>
          <option value="cancelled">{t("statusFilter.cancelled")}</option>
          <option value="expired">{t("statusFilter.expired")}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsTotal")}</p>
          <p className="text-2xl font-bold">{rfqs.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsOpen")}</p>
          <p className="text-2xl font-bold text-blue-600">{rfqs.filter(r => r.status === "open").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsEvaluating")}</p>
          <p className="text-2xl font-bold text-yellow-600">{rfqs.filter(r => r.status === "evaluating").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("statsAwarded")}</p>
          <p className="text-2xl font-bold text-green-600">{rfqs.filter(r => r.status === "awarded").length}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title={t("noResults")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((rfq) => {
            return (
              <Link
                key={rfq.id}
                href={`/dashboard/rfq/${rfq.id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
                      <StatusBadge entity="projects" status={rfq.status} />
                      {rfq.sustainability_priority && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          {t("eco")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{rfq.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {rfq.brand_name} · {rfq.category_name} · {t("units", { quantity: rfq.quantity })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t("budget")}</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(rfq.budget_min, locale)} – {formatCurrency(rfq.budget_max, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t("proposals")}</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">{rfq.proposals_count}</p>
                    </div>
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
