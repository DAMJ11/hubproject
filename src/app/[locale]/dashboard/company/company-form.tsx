"use client";

import { useState } from "react";
import { Factory, Save, Loader2, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CompanyDetail } from "@/lib/data/companies";

interface CompanyFormProps {
  company: CompanyDetail;
}

export default function CompanyForm({ company }: CompanyFormProps) {
  const t = useTranslations("Company");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: company.name || "",
    description: company.description || "",
    addressLine1: company.address_line1 || "",
    city: company.city || "",
    state: company.state || "",
    country: company.country || "Colombia",
    employeeCount: company.employee_count || "",
    foundedYear: company.founded_year?.toString() || "",
  });

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        toast.success(t("saved"));
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(data.message || t("saveError"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {t("title")}
            {company.is_verified && <CheckCircle className="w-5 h-5 text-brand-600" />}
          </h1>
          <p className="text-gray-500 mt-1">
            {company.type === "manufacturer" ? t("manufacturerProfile") : t("brandProfile")}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("name")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("description")}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        <div className="border-t dark:border-slate-700 pt-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {t("location")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("address")}</label>
              <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("city")}</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("state")}</label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("country")}</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("employees")}</label>
            <select
              value={form.employeeCount}
              onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
            >
              <option value="">{t("select")}</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("foundedYear")}</label>
            <Input
              type="number"
              value={form.foundedYear}
              onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
              min="1900"
              max="2026"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {t("saveChanges")}
          </Button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {t("saved")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
