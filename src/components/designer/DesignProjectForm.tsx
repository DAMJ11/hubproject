"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CATEGORIES = [
  "collections", "tech_packs", "patterns", "illustration", "branding", "consulting",
];
const CURRENCIES = ["USD", "EUR", "GBP", "COP"];

interface DesignProjectFormProps {
  projectId?: number;
}

export default function DesignProjectForm({ projectId }: DesignProjectFormProps) {
  const t = useTranslations("DesignProjects");
  const router = useRouter();
  const isEdit = !!projectId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "collections",
    season: "",
    budgetMin: "",
    budgetMax: "",
    currency: "USD",
    deadline: "",
    proposalsDeadline: "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`/api/design-projects/${projectId}`);
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          setForm({
            title: d.title || "",
            description: d.description || "",
            category: d.category || "collections",
            season: d.season || "",
            budgetMin: d.budget_min ? String(d.budget_min) : "",
            budgetMax: d.budget_max ? String(d.budget_max) : "",
            currency: d.currency || "USD",
            deadline: d.deadline ? d.deadline.split("T")[0] : "",
            proposalsDeadline: d.proposals_deadline ? d.proposals_deadline.split("T")[0] : "",
          });
        }
      } catch {
        toast.error(t("errorLoading"));
      } finally {
        setLoadingData(false);
      }
    })();
  }, [isEdit, projectId, t]);

  const handleSubmit = async (publishNow: boolean) => {
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error(t("titleRequired"));
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      toast.error(t("descriptionRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        status: publishNow ? "open" : "draft",
      };

      const url = isEdit ? `/api/design-projects/${projectId}` : "/api/design-projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(publishNow ? t("published") : t("savedDraft"));
        router.push("/dashboard/design-projects");
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <div className="py-12 text-center text-muted-foreground">{t("loading")}</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/design-projects">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">{isEdit ? t("editProject") : t("newProject")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("projectDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("projectTitle")} *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder={t("titlePlaceholder")}
              maxLength={255}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("descriptionLabel")} *</label>
            <textarea
              className="w-full mt-1 rounded-md border px-3 py-2 text-sm min-h-[120px] resize-y"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t("descriptionPlaceholder")}
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("categoryLabel")} *</label>
              <select
                className="w-full mt-1 rounded-md border px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`category.${c}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("seasonLabel")}</label>
              <Input
                value={form.season}
                onChange={(e) => setForm(f => ({ ...f, season: e.target.value }))}
                placeholder="SS26, FW26..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">{t("budgetMin")}</label>
              <Input
                type="number"
                min="0"
                value={form.budgetMin}
                onChange={(e) => setForm(f => ({ ...f, budgetMin: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("budgetMax")}</label>
              <Input
                type="number"
                min="0"
                value={form.budgetMax}
                onChange={(e) => setForm(f => ({ ...f, budgetMax: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("currency")}</label>
              <select
                className="w-full mt-1 rounded-md border px-3 py-2 text-sm"
                value={form.currency}
                onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("deadline")}</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("proposalsDeadline")}</label>
              <Input
                type="date"
                value={form.proposalsDeadline}
                onChange={(e) => setForm(f => ({ ...f, proposalsDeadline: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {t("saveDraft")}
        </Button>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => handleSubmit(true)} disabled={saving}>
          <Send className="mr-2 h-4 w-4" />
          {t("publish")}
        </Button>
      </div>
    </div>
  );
}
