"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Plus,
  X,
  Leaf,
  Package,
  FileText,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

/* ── Zod schema (client-side, matches server rfqCreateSchema) ── */
const materialSchema = z.object({
  materialType: z.string().min(1, "Requerido").max(200),
  composition: z.string().max(500).optional(),
  recycledPercentage: z.string().optional(),
  specifications: z.string().max(2000).optional(),
});

const rfqFormSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  title: z.string().min(3, "Mínimo 3 caracteres").max(300),
  description: z.string().min(10, "Mínimo 10 caracteres").max(5000),
  quantity: z.string().min(1, "Mínimo 1 unidad"),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  deadline: z.string().optional(),
  proposalsDeadline: z.string().optional(),
  requiresSample: z.boolean(),
  preferredMaterials: z.string().max(1000).optional(),
  sustainabilityPriority: z.boolean(),
  materials: z.array(materialSchema).optional(),
});

type RFQFormData = z.infer<typeof rfqFormSchema>;

interface Category {
  id: number;
  name: string;
}

const STEPS = [
  { key: "basic", icon: FileText },
  { key: "budget", icon: Package },
  { key: "materials", icon: Leaf },
  { key: "review", icon: ClipboardList },
] as const;

/* ── Fields validated per step ── */
const STEP_FIELDS: Record<number, (keyof RFQFormData)[]> = {
  0: ["categoryId", "title", "description", "quantity"],
  1: ["budgetMin", "budgetMax", "deadline", "proposalsDeadline"],
  2: ["preferredMaterials", "materials", "requiresSample", "sustainabilityPriority"],
  3: [],
};

export default function RFQMultiStepForm() {
  const t = useTranslations("ProjectNew");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RFQFormData>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
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
      materials: [{ materialType: "", composition: "", recycledPercentage: "" }],
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "materials" });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  /* ── Step navigation ── */
  const goNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step];
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  /* ── Submit ── */
  const onSubmit = async (data: RFQFormData) => {
    setIsSubmitting(true);
    try {
      const validMaterials = (data.materials ?? [])
        .filter((m) => m.materialType.trim())
        .map((m) => ({
          ...m,
          recycledPercentage: m.recycledPercentage ? Number(m.recycledPercentage) : undefined,
        }));
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(data.categoryId),
          title: data.title,
          description: data.description,
          quantity: Number(data.quantity),
          budgetMin: data.budgetMin ? Number(data.budgetMin) : undefined,
          budgetMax: data.budgetMax ? Number(data.budgetMax) : undefined,
          deadline: data.deadline || undefined,
          proposalsDeadline: data.proposalsDeadline || undefined,
          requiresSample: data.requiresSample,
          preferredMaterials: data.preferredMaterials || undefined,
          sustainabilityPriority: data.sustainabilityPriority,
          materials: validMaterials.length > 0 ? validMaterials : undefined,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(t("createdSuccess"));
        router.push("/dashboard/projects");
      } else {
        toast.error(result.message || t("createError"));
      }
    } catch {
      toast.error(t("connectionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const values = watch();
  const inputClass =
    "h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-brand-600 focus:ring-brand-600";
  const errorClass = "text-xs text-red-500 mt-1";

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === Number(id))?.name ?? "—";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          aria-label={t("back")}
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  done
                    ? "bg-brand-600 text-white"
                    : active
                      ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-400"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </button>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active
                    ? "text-brand-700 dark:text-brand-200"
                    : done
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400"
                }`}
              >
                {t(`steps.${s.key}`)}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full ${
                    done ? "bg-brand-600" : "bg-gray-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5"
      >
        {/* ── STEP 0: Básico ── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("steps.basic")}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("fields.title")} <span className="text-red-400">*</span>
              </label>
              <Input
                {...register("title")}
                placeholder={t("placeholders.title")}
                className={`${inputClass} ${errors.title ? "border-red-400" : ""}`}
              />
              {errors.title && (
                <p className={errorClass}>{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.category")} <span className="text-red-400">*</span>
                </label>
                <select
                  {...register("categoryId")}
                  className={`w-full ${inputClass} ${errors.categoryId ? "border-red-400" : ""}`}
                >
                  <option value="">{t("placeholders.select")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className={errorClass}>{errors.categoryId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.quantity")} <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  {...register("quantity")}
                  placeholder={t("placeholders.quantity")}
                  className={`${inputClass} ${errors.quantity ? "border-red-400" : ""}`}
                />
                {errors.quantity && (
                  <p className={errorClass}>{errors.quantity.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("fields.description")} <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder={t("placeholders.description")}
                className={`w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 focus:border-brand-600 focus:ring-brand-600 ${errors.description ? "border-red-400" : ""}`}
              />
              {errors.description && (
                <p className={errorClass}>{errors.description.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 1: Presupuesto y Fechas ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("steps.budget")}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.budgetMin")}
                </label>
                <Input
                  type="number"
                  {...register("budgetMin")}
                  placeholder={t("placeholders.budgetMin")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.budgetMax")}
                </label>
                <Input
                  type="number"
                  {...register("budgetMax")}
                  placeholder={t("placeholders.budgetMax")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.deadline")}
                </label>
                <Input type="date" {...register("deadline")} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("fields.proposalsDeadline")}
                </label>
                <Input
                  type="date"
                  {...register("proposalsDeadline")}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Materiales y Sostenibilidad ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("steps.materials")}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("fields.preferredMaterials")}
              </label>
              <Input
                {...register("preferredMaterials")}
                placeholder={t("placeholders.materials")}
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("fields.materialsSpec")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    append({ materialType: "", composition: "", recycledPercentage: "" })
                  }
                  className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {t("addMaterial")}
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <Input
                      {...register(`materials.${i}.materialType`)}
                      placeholder={t("placeholders.materialType")}
                      className={`flex-1 ${inputClass}`}
                    />
                    <Input
                      {...register(`materials.${i}.composition`)}
                      placeholder={t("placeholders.composition")}
                      className={`flex-1 ${inputClass}`}
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...register(`materials.${i}.recycledPercentage`)}
                      placeholder={t("placeholders.recycledPercent")}
                      className={`w-24 ${inputClass}`}
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="p-2 text-red-400 hover:text-red-600"
                        aria-label={t("removeMaterial")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Controller
                control={control}
                name="requiresSample"
                render={({ field }) => (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t("requiresSample")}
                    </span>
                  </label>
                )}
              />
              <Controller
                control={control}
                name="sustainabilityPriority"
                render={({ field }) => (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t("sustainabilityPriority")}
                    </span>
                  </label>
                )}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Revisión ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("steps.review")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("reviewDescription")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReviewField label={t("fields.title")} value={values.title} />
              <ReviewField
                label={t("fields.category")}
                value={getCategoryName(values.categoryId)}
              />
              <ReviewField
                label={t("fields.quantity")}
                value={String(values.quantity || "—")}
              />
              <ReviewField
                label={t("fields.budgetMin")}
                value={values.budgetMin ? `$${values.budgetMin}` : "—"}
              />
              <ReviewField
                label={t("fields.budgetMax")}
                value={values.budgetMax ? `$${values.budgetMax}` : "—"}
              />
              <ReviewField
                label={t("fields.deadline")}
                value={values.deadline || "—"}
              />
              <ReviewField
                label={t("fields.proposalsDeadline")}
                value={values.proposalsDeadline || "—"}
              />
              <ReviewField
                label={t("requiresSample")}
                value={values.requiresSample ? "✓" : "—"}
              />
              <ReviewField
                label={t("sustainabilityPriority")}
                value={values.sustainabilityPriority ? "✓" : "—"}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("fields.description")}
              </label>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mt-1">
                {values.description || "—"}
              </p>
            </div>

            {(values.materials ?? []).some((m) => m.materialType.trim()) && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("fields.materialsSpec")}
                </label>
                <div className="mt-1 space-y-1">
                  {(values.materials ?? [])
                    .filter((m) => m.materialType.trim())
                    .map((m, i) => (
                      <p key={i} className="text-sm text-gray-900 dark:text-white">
                        {m.materialType}
                        {m.composition ? ` · ${m.composition}` : ""}
                        {m.recycledPercentage && Number(m.recycledPercentage) > 0
                          ? ` · ${m.recycledPercentage}% reciclado`
                          : ""}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
            >
              {t("next")} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
        {value || "—"}
      </p>
    </div>
  );
}
