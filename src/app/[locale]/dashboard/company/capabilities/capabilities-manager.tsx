"use client";

import { useState } from "react";
import { Package, Plus, Trash2, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import type { CapabilityItem, CategoryItem } from "@/lib/data/capabilities";

interface Props {
  initialCapabilities: CapabilityItem[];
  categories: CategoryItem[];
}

export default function CapabilitiesManager({ initialCapabilities, categories }: Props) {
  const t = useTranslations("Capabilities");
  const tCat = useTranslations("ServiceCategories");
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>(initialCapabilities);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    minOrderQty: "1",
    maxMonthlyCapacity: "",
    leadTimeDays: "",
    commercialNotes: "",
    description: "",
  });

  const refreshCapabilities = async () => {
    try {
      const res = await fetch("/api/manufacturers/capabilities");
      const data = await res.json();
      if (data.success) setCapabilities(data.data);
    } catch (err) {
      console.error(err);
    }
  };

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
          commercialNotes: form.commercialNotes || null,
          description: form.description || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("addSuccess"));
        setShowForm(false);
        setForm({
          categoryId: "",
          minOrderQty: "1",
          maxMonthlyCapacity: "",
          leadTimeDays: "",
          commercialNotes: "",
          description: "",
        });
        refreshCapabilities();
      } else {
        toast.error(data.error || t("addError"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("addError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/manufacturers/capabilities?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCapabilities((prev) => prev.filter((c) => c.id !== id));
        toast.success(t("deleteSuccess"));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-600 hover:bg-brand-700 text-white">
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
                  <option key={cat.id} value={cat.id}>{tCat.has(cat.slug) ? tCat(cat.slug) : cat.name}</option>
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
            <Button onClick={handleAdd} disabled={saving || !form.categoryId} className="bg-brand-600 hover:bg-brand-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("save")}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
          </div>
        </div>
      )}

      {capabilities.length === 0 ? (
        <EmptyState icon={Settings} title={t("empty")} description={t("emptyHint")} />
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
                    {cap.description && <p className="text-sm text-gray-400 mt-1">{cap.description}</p>}
                    {cap.commercial_notes && <p className="text-xs text-gray-500 mt-1">{cap.commercial_notes}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(cap.id)} className="text-gray-400 hover:text-red-500 p-1" aria-label={t("delete")}>
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
