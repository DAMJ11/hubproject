"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle, Globe, ImagePlus, Instagram, Loader2, MapPin, Save, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CompanyDetail } from "@/lib/data/companies";

interface CompanyFormProps {
  company: CompanyDetail;
}

type BrandCategory = "Womenswear" | "Menswear" | "Streetwear" | "Activewear" | "Luxury" | "Swimwear" | "Other";

const BRAND_CATEGORY_OPTIONS: BrandCategory[] = ["Womenswear", "Menswear", "Streetwear", "Activewear", "Luxury", "Swimwear", "Other"];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CompanyForm({ company }: CompanyFormProps) {
  const t = useTranslations("Company");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initialCategories = useMemo(() => {
    try {
      const parsed = JSON.parse(company.brand_categories || "[]");
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [];
    }
  }, [company.brand_categories]);

  const [form, setForm] = useState({
    name: company.name || "",
    description: company.description || "",
    logoUrl: company.logo_url || "",
    coverImageUrl: company.cover_image_url || "",
    city: company.city || "",
    country: company.country || "Colombia",
    website: company.website || "",
    instagramHandle: company.instagram_handle || "",
    brandTagline: company.brand_tagline || "",
    brandCategories: initialCategories as string[],
    shipsWorldwide: Boolean(company.ships_worldwide),
  });

  const onFilePicked = async (file: File | null, target: "logoUrl" | "coverImageUrl") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("invalidImageType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageMaxSize"));
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, [target]: base64 }));
    } catch {
      toast.error(t("uploadError"));
    }
  };

  const toggleCategory = (cat: BrandCategory) => {
    setForm((prev) => {
      const exists = prev.brandCategories.includes(cat);
      if (exists) return { ...prev, brandCategories: prev.brandCategories.filter((c) => c !== cat) };
      if (prev.brandCategories.length >= 3) return prev;
      return { ...prev, brandCategories: [...prev.brandCategories, cat] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          logoUrl: form.logoUrl,
          coverImageUrl: form.coverImageUrl,
          city: form.city,
          country: form.country,
          website: form.website,
          instagramHandle: form.instagramHandle,
          brandTagline: form.brandTagline,
          brandCategories: JSON.stringify(form.brandCategories),
          shipsWorldwide: form.shipsWorldwide,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || t("saveError"));
        return;
      }

      setSaved(true);
      toast.success(t("saved"));
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{company.type === "manufacturer" ? t("manufacturerProfile") : t("brandProfile")}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("publicProfileTitle")}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("publicProfileSubtitle")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("brandName")}</label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder={t("brandNamePlaceholder")} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("brandBio")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value.slice(0, 300) }))}
                  rows={4}
                  placeholder={t("brandBioPlaceholder")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <p className="mt-1 text-right text-xs text-gray-500">{form.description.length}/300</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("brandLogo")}</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-gray-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60">
                  <Upload className="h-4 w-4" />
                  {form.logoUrl ? t("replaceLogo") : t("uploadLogo")}
                  <input className="hidden" type="file" accept="image/*" onChange={(e) => onFilePicked(e.target.files?.[0] || null, "logoUrl")} />
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("coverImage")}</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-gray-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60">
                  <ImagePlus className="h-4 w-4" />
                  {form.coverImageUrl ? t("replaceCoverImage") : t("uploadCoverImage")}
                  <input className="hidden" type="file" accept="image/*" onChange={(e) => onFilePicked(e.target.files?.[0] || null, "coverImageUrl")} />
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("city")}</label>
                <Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder={t("cityPlaceholder")} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("country")}</label>
                <Input value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} placeholder={t("countryPlaceholder")} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("website")}</label>
                <Input value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://yourbrand.com" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("instagram")}</label>
                <Input value={form.instagramHandle} onChange={(e) => setForm((prev) => ({ ...prev, instagramHandle: e.target.value }))} placeholder="@yourbrand" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("brandCategories")}</label>
                <div className="flex flex-wrap gap-2">
                  {BRAND_CATEGORY_OPTIONS.map((cat) => {
                    const active = form.brandCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-brand-600 bg-brand-100 text-brand-800 dark:border-brand-500 dark:bg-brand-900/50 dark:text-brand-200" : "border-slate-300 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-gray-500">{t("categoriesHint")}</p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("brandTagline")}</label>
                <Input value={form.brandTagline} onChange={(e) => setForm((prev) => ({ ...prev, brandTagline: e.target.value.slice(0, 100) }))} placeholder={t("brandTaglinePlaceholder")} />
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <input type="checkbox" checked={form.shipsWorldwide} onChange={(e) => setForm((prev) => ({ ...prev, shipsWorldwide: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
                  {t("shipsWorldwide")}
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 text-white hover:bg-brand-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t("savePublicProfile")}
              </Button>
              {saved && (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><CheckCircle className="h-4 w-4" /> {t("saved")}</span>
              )}
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Sparkles className="h-4 w-4" /> {t("previewTitle")}</div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
              <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
                {form.coverImageUrl ? <img src={form.coverImageUrl} alt={form.name || "cover"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">{t("noCover")}</div>}
              </div>

              <div className="relative px-4 pb-4 pt-9">
                <div className="absolute -top-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 dark:border-slate-950 dark:bg-slate-800">
                  {form.logoUrl ? <img src={form.logoUrl} alt={form.name || "logo"} className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6 text-slate-400" />}
                </div>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{form.name || t("brandNamePlaceholder")}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{form.description || t("brandBioPlaceholder")}</p>

                <div className="mt-3 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                  {(form.city || form.country) && <p className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {[form.city, form.country].filter(Boolean).join(", ")}</p>}
                  {form.website && <p className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {form.website}</p>}
                  {form.instagramHandle && <p className="inline-flex items-center gap-1"><Instagram className="h-3.5 w-3.5" /> {form.instagramHandle}</p>}
                </div>

                {form.brandCategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.brandCategories.map((cat) => <span key={cat} className="rounded-full bg-brand-100 px-2.5 py-1 text-xs text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">{cat}</span>)}
                  </div>
                )}

                {form.brandTagline && <p className="mt-3 text-sm italic text-slate-600 dark:text-slate-300">{form.brandTagline}</p>}

                {form.shipsWorldwide && <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{t("shipsWorldwide")}</div>}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t("securityHint")}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
