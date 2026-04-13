"use client";

import { useState, useEffect } from "react";
import {
  Save, Loader2, Upload, ImagePlus, Globe, Instagram,
  MapPin, Clock, DollarSign, Palette, CheckCircle, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const SPECIALTIES = [
  { key: "collections", label: "Collections" },
  { key: "tech_packs", label: "Tech Packs" },
  { key: "patterns", label: "Patterns / Moldes" },
  { key: "illustration", label: "Fashion Illustration" },
  { key: "branding", label: "Branding / Identity" },
  { key: "consulting", label: "Trend Consulting" },
];

const AVAILABILITY_OPTIONS = [
  { key: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { key: "busy", label: "Busy", color: "bg-yellow-100 text-yellow-700" },
  { key: "unavailable", label: "Unavailable", color: "bg-red-100 text-red-700" },
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface DesignerProfileData {
  display_name: string;
  bio: string;
  specialties: string;
  years_experience: number | null;
  portfolio_url: string;
  instagram_handle: string;
  behance_url: string;
  dribbble_url: string;
  linkedin_url: string;
  website_url: string;
  location_city: string;
  location_country: string;
  availability_status: string;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  currency: string;
  is_freelance: boolean;
  avatar_url: string;
  cover_image_url: string;
}

export default function DesignerProfileForm() {
  const t = useTranslations("DesignerProfile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    specialties: [] as string[],
    yearsExperience: "",
    portfolioUrl: "",
    instagramHandle: "",
    behanceUrl: "",
    dribbbleUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    locationCity: "",
    locationCountry: "Colombia",
    availabilityStatus: "available",
    hourlyRateMin: "",
    hourlyRateMax: "",
    currency: "USD",
    isFreelance: true,
    avatarUrl: "",
    coverImageUrl: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/designer/profile");
        const data = await res.json();
        if (data.success && data.data) {
          const p: DesignerProfileData = data.data;
          let specs: string[] = [];
          try { specs = JSON.parse(p.specialties || "[]"); } catch { specs = []; }
          setForm({
            displayName: p.display_name || "",
            bio: p.bio || "",
            specialties: specs,
            yearsExperience: p.years_experience?.toString() || "",
            portfolioUrl: p.portfolio_url || "",
            instagramHandle: p.instagram_handle || "",
            behanceUrl: p.behance_url || "",
            dribbbleUrl: p.dribbble_url || "",
            linkedinUrl: p.linkedin_url || "",
            websiteUrl: p.website_url || "",
            locationCity: p.location_city || "",
            locationCountry: p.location_country || "Colombia",
            availabilityStatus: p.availability_status || "available",
            hourlyRateMin: p.hourly_rate_min?.toString() || "",
            hourlyRateMax: p.hourly_rate_max?.toString() || "",
            currency: p.currency || "USD",
            isFreelance: p.is_freelance,
            avatarUrl: p.avatar_url || "",
            coverImageUrl: p.cover_image_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onFilePicked = async (file: File | null, target: "avatarUrl" | "coverImageUrl") => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }
    const base64 = await fileToBase64(file);
    setForm((prev) => ({ ...prev, [target]: base64 }));
  };

  const toggleSpecialty = (key: string) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(key)
        ? prev.specialties.filter((s) => s !== key)
        : [...prev.specialties, key],
    }));
  };

  const handleSave = async () => {
    if (!form.displayName.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/designer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
          hourlyRateMin: form.hourlyRateMin ? Number(form.hourlyRateMin) : null,
          hourlyRateMax: form.hourlyRateMax ? Number(form.hourlyRateMax) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        toast.success(t("saved"));
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(data.message || t("errorSaving"));
      }
    } catch {
      toast.error(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Cover image */}
      <div className="relative h-48 rounded-xl bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-gray-800 overflow-hidden">
        {form.coverImageUrl && (
          <img src={form.coverImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <label className="absolute bottom-3 right-3 cursor-pointer bg-white/80 dark:bg-gray-800/80 rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:bg-white transition">
          <ImagePlus className="h-4 w-4" />
          {t("changeCover")}
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onFilePicked(e.target.files?.[0] || null, "coverImageUrl")} />
        </label>
      </div>

      {/* Avatar + Name section */}
      <div className="flex items-end gap-4 -mt-12 ml-6 relative z-10">
        <label className="cursor-pointer group">
          <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 border-4 border-white dark:border-gray-900 flex items-center justify-center overflow-hidden">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-amber-600" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow group-hover:bg-amber-50 transition">
            <Upload className="h-3 w-3" />
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onFilePicked(e.target.files?.[0] || null, "avatarUrl")} />
        </label>
        <div className="pb-1">
          <Input
            value={form.displayName}
            onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
            placeholder={t("displayNamePlaceholder")}
            className="text-lg font-bold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("bio")}</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          rows={4}
          maxLength={1000}
          placeholder={t("bioPlaceholder")}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">{form.bio.length}/1000</p>
      </div>

      {/* Specialties */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Palette className="h-4 w-4" /> {t("specialties")}
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSpecialty(s.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                form.specialties.includes(s.key)
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Clock className="h-4 w-4" /> {t("availability")}
        </label>
        <div className="flex gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setForm((p) => ({ ...p, availabilityStatus: opt.key }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.availabilityStatus === opt.key ? opt.color + " ring-2 ring-offset-1" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience + Freelance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("yearsExperience")}</label>
          <Input
            type="number"
            min={0}
            max={50}
            value={form.yearsExperience}
            onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("type")}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isFreelance: true }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.isFreelance ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}
            >
              Freelance
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isFreelance: false }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !form.isFreelance ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}
            >
              Studio
            </button>
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> {t("hourlyRates")}
        </label>
        <div className="grid grid-cols-3 gap-3">
          <Input
            type="number"
            min={0}
            value={form.hourlyRateMin}
            onChange={(e) => setForm((p) => ({ ...p, hourlyRateMin: e.target.value }))}
            placeholder={t("minRate")}
          />
          <Input
            type="number"
            min={0}
            value={form.hourlyRateMax}
            onChange={(e) => setForm((p) => ({ ...p, hourlyRateMax: e.target.value }))}
            placeholder={t("maxRate")}
          />
          <select
            value={form.currency}
            onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="COP">COP</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {t("location")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={form.locationCity}
            onChange={(e) => setForm((p) => ({ ...p, locationCity: e.target.value }))}
            placeholder={t("city")}
          />
          <Input
            value={form.locationCountry}
            onChange={(e) => setForm((p) => ({ ...p, locationCountry: e.target.value }))}
            placeholder={t("country")}
          />
        </div>
      </div>

      {/* Social links */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Globe className="h-4 w-4" /> {t("socialLinks")}
        </label>
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              value={form.instagramHandle}
              onChange={(e) => setForm((p) => ({ ...p, instagramHandle: e.target.value }))}
              placeholder="@username"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              value={form.websiteUrl}
              onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-center flex-shrink-0">Be</span>
            <Input
              value={form.behanceUrl}
              onChange={(e) => setForm((p) => ({ ...p, behanceUrl: e.target.value }))}
              placeholder="https://behance.net/yourprofile"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-center flex-shrink-0">Dr</span>
            <Input
              value={form.dribbbleUrl}
              onChange={(e) => setForm((p) => ({ ...p, dribbbleUrl: e.target.value }))}
              placeholder="https://dribbble.com/yourprofile"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-center flex-shrink-0">Li</span>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => setForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-center flex-shrink-0">🔗</span>
            <Input
              value={form.portfolioUrl}
              onChange={(e) => setForm((p) => ({ ...p, portfolioUrl: e.target.value }))}
              placeholder={t("externalPortfolio")}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white min-w-[140px]"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("saving")}</>
          ) : saved ? (
            <><CheckCircle className="h-4 w-4 mr-2" /> {t("saved")}</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> {t("saveProfile")}</>
          )}
        </Button>
      </div>
    </div>
  );
}
