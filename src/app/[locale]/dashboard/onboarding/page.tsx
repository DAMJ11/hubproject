"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Check,
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ── Zod schema per step ── */
const step1Schema = z.object({
  description: z.string().min(10, "Mínimo 10 caracteres").max(2000),
  phone: z.string().min(5, "Teléfono requerido").max(30),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

const step2Schema = z.object({
  addressLine1: z.string().min(3, "Dirección requerida").max(300),
  city: z.string().min(2, "Ciudad requerida").max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().min(2, "País requerido").max(100),
});

const step3Schema = z.object({
  employeeCount: z.string().optional(),
  foundedYear: z.string().optional(),
  legalId: z.string().max(50).optional().or(z.literal("")),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const STEPS = [
  { key: "company", icon: Building2 },
  { key: "location", icon: MapPin },
  { key: "details", icon: Sparkles },
] as const;

export default function OnboardingWizard() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [companyData, setCompanyData] = useState<Record<string, string | number | null>>({});

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { description: "", phone: "", website: "" },
    mode: "onTouched",
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { addressLine1: "", city: "", state: "", country: "Colombia" },
    mode: "onTouched",
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { employeeCount: "", foundedYear: "", legalId: "" },
    mode: "onTouched",
  });

  /* Load existing company data to pre-fill */
  useEffect(() => {
    fetch("/api/companies/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const c = data.data;
          step1Form.reset({
            description: c.description || "",
            phone: c.phone || "",
            website: c.website || "",
          });
          step2Form.reset({
            addressLine1: c.address_line1 || "",
            city: c.city || "",
            state: c.state || "",
            country: c.country || "Colombia",
          });
          step3Form.reset({
            employeeCount: c.employee_count || "",
            foundedYear: c.founded_year || "",
            legalId: c.legal_id || "",
          });
          setCompanyData(c);
        }
      })
      .catch(() => {});
  }, []);

  const saveStep = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.message || t("saveError"));
        return false;
      }
      return true;
    } catch {
      toast.error(t("connectionError"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStep1 = async (data: Step1Data) => {
    const ok = await saveStep(data);
    if (ok) setStep(1);
  };

  const handleStep2 = async (data: Step2Data) => {
    const ok = await saveStep(data);
    if (ok) setStep(2);
  };

  const handleStep3 = async (data: Step3Data) => {
    const payload: Record<string, unknown> = {};
    if (data.employeeCount) payload.employeeCount = data.employeeCount;
    if (data.foundedYear) payload.foundedYear = Number(data.foundedYear);
    if (data.legalId) payload.legalId = data.legalId;

    const ok = Object.keys(payload).length > 0 ? await saveStep(payload) : true;
    if (ok) {
      toast.success(t("completed"));
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const inputClass =
    "h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-brand-600 focus:ring-brand-600";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    done
                      ? "bg-brand-600 text-white"
                      : active
                        ? "bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200 ring-2 ring-brand-600"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-400"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 rounded-full ${
                      done ? "bg-brand-600" : "bg-gray-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          {/* Step 1: Company info */}
          {step === 0 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("step1Title")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("step1Description")}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.description")} <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...step1Form.register("description")}
                  rows={3}
                  placeholder={t("placeholders.description")}
                  className={`w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 focus:border-brand-600 focus:ring-brand-600 ${step1Form.formState.errors.description ? "border-red-400" : ""}`}
                />
                {step1Form.formState.errors.description && (
                  <p className={errorClass}>{step1Form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.phone")} <span className="text-red-400">*</span>
                </label>
                <Input
                  {...step1Form.register("phone")}
                  placeholder={t("placeholders.phone")}
                  className={`${inputClass} ${step1Form.formState.errors.phone ? "border-red-400" : ""}`}
                />
                {step1Form.formState.errors.phone && (
                  <p className={errorClass}>{step1Form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.website")}
                </label>
                <Input
                  {...step1Form.register("website")}
                  placeholder="https://..."
                  className={`${inputClass} ${step1Form.formState.errors.website ? "border-red-400" : ""}`}
                />
                {step1Form.formState.errors.website && (
                  <p className={errorClass}>{step1Form.formState.errors.website.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button type="button" variant="outline" onClick={handleSkip} className="flex-1">
                  {t("skipForNow")}
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t("next")} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Location */}
          {step === 1 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("step2Title")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("step2Description")}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.address")} <span className="text-red-400">*</span>
                </label>
                <Input
                  {...step2Form.register("addressLine1")}
                  placeholder={t("placeholders.address")}
                  className={`${inputClass} ${step2Form.formState.errors.addressLine1 ? "border-red-400" : ""}`}
                />
                {step2Form.formState.errors.addressLine1 && (
                  <p className={errorClass}>{step2Form.formState.errors.addressLine1.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("fields.city")} <span className="text-red-400">*</span>
                  </label>
                  <Input
                    {...step2Form.register("city")}
                    placeholder={t("placeholders.city")}
                    className={`${inputClass} ${step2Form.formState.errors.city ? "border-red-400" : ""}`}
                  />
                  {step2Form.formState.errors.city && (
                    <p className={errorClass}>{step2Form.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("fields.state")}
                  </label>
                  <Input
                    {...step2Form.register("state")}
                    placeholder={t("placeholders.state")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.country")} <span className="text-red-400">*</span>
                </label>
                <Input
                  {...step2Form.register("country")}
                  className={`${inputClass} ${step2Form.formState.errors.country ? "border-red-400" : ""}`}
                />
                {step2Form.formState.errors.country && (
                  <p className={errorClass}>{step2Form.formState.errors.country.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                  {t("back")}
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t("next")} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Extra details */}
          {step === 2 && (
            <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("step3Title")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("step3Description")}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.employees")}
                </label>
                <select
                  {...step3Form.register("employeeCount")}
                  className={`w-full ${inputClass}`}
                >
                  <option value="">{t("placeholders.select")}</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.foundedYear")}
                </label>
                <Input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  {...step3Form.register("foundedYear")}
                  placeholder="2020"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.legalId")}
                </label>
                <Input
                  {...step3Form.register("legalId")}
                  placeholder={t("placeholders.legalId")}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  {t("back")}
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t("finish")}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Progress indicator */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          {t("stepOf", { current: step + 1, total: STEPS.length })}
        </p>
      </div>
    </div>
  );
}
