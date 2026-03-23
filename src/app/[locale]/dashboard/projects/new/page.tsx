"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
}

export default function NewProjectPage() {
  const t = useTranslations("ProjectNew");
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    quantity: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    proposalsDeadline: "",
    requiresSample: false,
    preferredMaterials: "",
    sustainabilityPriority: false,
  });

  const [materials, setMaterials] = useState([{ materialType: "", composition: "", recycledPercentage: 0 }]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (data.success) setCategories(data.categories); })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setError("");
  };

  const handleMaterialChange = (index: number, field: string, value: string | number) => {
    setMaterials((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMaterial = () => setMaterials((prev) => [...prev, { materialType: "", composition: "", recycledPercentage: 0 }]);
  const removeMaterial = (index: number) => setMaterials((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.title || !form.description || !form.quantity) {
      setError(t("requiredFieldsError"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const validMaterials = materials.filter((m) => m.materialType.trim());
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          title: form.title,
          description: form.description,
          quantity: Number(form.quantity),
          budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
          budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
          deadline: form.deadline || undefined,
          proposalsDeadline: form.proposalsDeadline || undefined,
          requiresSample: form.requiresSample,
          preferredMaterials: form.preferredMaterials || undefined,
          sustainabilityPriority: form.sustainabilityPriority,
          materials: validMaterials.length > 0 ? validMaterials : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/projects");
      } else {
        setError(data.message || t("createError"));
      }
    } catch {
      setError(t("connectionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-[#2563eb] focus:ring-[#2563eb]";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        {/* Básicos */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.title")}</label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder={t("placeholders.title")} className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.category")}</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={`w-full ${inputClass}`} required>
              <option value="">{t("placeholders.select")}</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.quantity")}</label>
            <Input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} placeholder={t("placeholders.quantity")} className={inputClass} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.description")}</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder={t("placeholders.description")} className={`w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 focus:border-[#2563eb] focus:ring-[#2563eb]`} required />
        </div>

        {/* Presupuesto y fechas */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.budgetMin")}</label>
            <Input name="budgetMin" type="number" value={form.budgetMin} onChange={handleChange} placeholder={t("placeholders.budgetMin")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.budgetMax")}</label>
            <Input name="budgetMax" type="number" value={form.budgetMax} onChange={handleChange} placeholder={t("placeholders.budgetMax")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.deadline")}</label>
            <Input name="deadline" type="date" value={form.deadline} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.proposalsDeadline")}</label>
            <Input name="proposalsDeadline" type="date" value={form.proposalsDeadline} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Materiales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("fields.preferredMaterials")}</label>
          <Input name="preferredMaterials" value={form.preferredMaterials} onChange={handleChange} placeholder={t("placeholders.materials")} className={inputClass} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fields.materialsSpec")}</label>
            <button type="button" onClick={addMaterial} className="text-xs text-[#2563eb] hover:underline">{t("addMaterial")}</button>
          </div>
          {materials.map((mat, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input placeholder={t("placeholders.materialType")} value={mat.materialType} onChange={(e) => handleMaterialChange(i, "materialType", e.target.value)} className={`flex-1 ${inputClass}`} />
              <Input placeholder={t("placeholders.composition")} value={mat.composition} onChange={(e) => handleMaterialChange(i, "composition", e.target.value)} className={`flex-1 ${inputClass}`} />
              <Input type="number" min="0" max="100" placeholder={t("placeholders.recycledPercent")} value={mat.recycledPercentage} onChange={(e) => handleMaterialChange(i, "recycledPercentage", Number(e.target.value))} className={`w-24 ${inputClass}`} />
              {materials.length > 1 && (
                <button type="button" onClick={() => removeMaterial(i)} className="text-red-400 hover:text-red-600 px-2">×</button>
              )}
            </div>
          ))}
        </div>

        {/* Opciones */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="requiresSample" checked={form.requiresSample} onChange={handleChange} className="rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t("requiresSample")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="sustainabilityPriority" checked={form.sustainabilityPriority} onChange={handleChange} className="rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t("sustainabilityPriority")}</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1" disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button type="submit" className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("submitting")}</> : t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

