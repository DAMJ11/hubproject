"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Trash2, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";

interface Capability {
  id: number;
  company_id: number;
  category_id: number;
  category_name: string;
  min_order_qty: number;
  max_monthly_capacity: number | null;
  lead_time_days: number | null;
  description: string | null;
  unit_price_from: number | null;
  wholesale_price_from: number | null;
  commercial_notes: string | null;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function CapabilitiesPage() {
  const t = useTranslations("Capabilities");
  const locale = useLocale();
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    minOrderQty: "1",
    maxMonthlyCapacity: "",
    leadTimeDays: "",
    unitPriceFrom: "",
    wholesalePriceFrom: "",
    commercialNotes: "",
    description: "",
  });

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  const fetchData = useCallback(async () => {
    try {
      const [capRes, catRes] = await Promise.all([
        fetch("/api/manufacturers/capabilities"),
        fetch("/api/categories"),
      ]);
      const capData = await capRes.json();
      const catData = await catRes.json();
      if (capData.success) setCapabilities(capData.data);
      if (catData.success) setCategories(catData.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!form.categoryId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/manufacturers/capabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          minOrderQty: Number(form.minOrderQty) || 1,
          maxMonthlyCapacity: form.maxMonthlyCapacity ? Number(form.maxMonthlyCapacity) : null,
          leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : null,
          unitPriceFrom: form.unitPriceFrom ? Number(form.unitPriceFrom) : null,
          wholesalePriceFrom: form.wholesalePriceFrom ? Number(form.wholesalePriceFrom) : null,
          commercialNotes: form.commercialNotes || null,
          description: form.description || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({
          categoryId: "",
          minOrderQty: "1",
          maxMonthlyCapacity: "",
          leadTimeDays: "",
          unitPriceFrom: "",
          wholesalePriceFrom: "",
          commercialNotes: "",
          description: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/manufacturers/capabilities?id=${id}`, { method: "DELETE" });
      setCapabilities((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
          <Plus className="w-4 h-4 mr-2" /> {t("add")}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">{t("newCapability")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("category")}</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("moqLabel")}</label>
              <Input type="number" value={form.minOrderQty} onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })} min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("monthlyCapacity")}</label>
              <Input type="number" value={form.maxMonthlyCapacity} onChange={(e) => setForm({ ...form, maxMonthlyCapacity: e.target.value })} placeholder={t("monthlyCapacityPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("leadTime")}</label>
              <Input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("unitPrice")}</label>
              <Input type="number" min="0" value={form.unitPriceFrom} onChange={(e) => setForm({ ...form, unitPriceFrom: e.target.value })} placeholder={t("unitPricePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("wholesalePrice")}</label>
              <Input type="number" min="0" value={form.wholesalePriceFrom} onChange={(e) => setForm({ ...form, wholesalePriceFrom: e.target.value })} placeholder={t("wholesalePricePlaceholder")} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("description")}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("commercialNotes")}</label>
            <textarea
              value={form.commercialNotes}
              onChange={(e) => setForm({ ...form, commercialNotes: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
              placeholder={t("commercialNotesPlaceholder")}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving || !form.categoryId} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("save")}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
          </div>
        </div>
      )}

      {capabilities.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <Settings className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t("empty")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {capabilities.map((cap) => (
            <div key={cap.id} className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                    <Package className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cap.category_name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span>{t("moq", { qty: cap.min_order_qty })}</span>
                      {cap.max_monthly_capacity && <span>{t("capacity", { qty: cap.max_monthly_capacity.toLocaleString() })}</span>}
                      {cap.lead_time_days && <span>{t("delivery", { days: cap.lead_time_days })}</span>}
                    </div>
                    {(cap.unit_price_from !== null || cap.wholesale_price_from !== null) && (
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {cap.unit_price_from !== null && (
                          <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-1">
                            {t("priceFrom", { price: formatCOP(cap.unit_price_from) })}
                          </span>
                        )}
                        {cap.wholesale_price_from !== null && (
                          <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-1">
                            {t("wholesaleFrom", { price: formatCOP(cap.wholesale_price_from) })}
                          </span>
                        )}
                      </div>
                    )}
                    {cap.description && <p className="text-sm text-gray-400 mt-1">{cap.description}</p>}
                    {cap.commercial_notes && <p className="text-xs text-gray-500 mt-1">{cap.commercial_notes}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(cap.id)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

