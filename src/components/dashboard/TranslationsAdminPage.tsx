"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Languages, Loader2, Save, Search, ShieldAlert, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";

type LocaleCode = "es" | "en" | "fr";

interface TranslationKeyItem {
  id: number;
  key_path: string;
  module: string;
  display_name: string;
  module_label: string;
  base_es: string;
  base_en: string;
  base_fr: string;
}

interface LocaleValues {
  baseValue: string;
  draftValue: string | null;
  publishedValue: string | null;
  effectiveValue: string;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
}

interface TranslationDetailResponse {
  key: {
    keyPath: string;
    module: string;
  };
  locales: Record<LocaleCode, LocaleValues>;
}

const locales: LocaleCode[] = ["es", "en", "fr"];

export default function TranslationsAdminPage() {
  const t = useTranslations("TranslationsAdmin");
  const { user, isLoading } = useDashboardUser();

  const [keys, setKeys] = useState<TranslationKeyItem[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<TranslationDetailResponse | null>(null);
  const [draftValues, setDraftValues] = useState<Record<LocaleCode, string>>({ es: "", en: "", fr: "" });
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingLocale, setSavingLocale] = useState<LocaleCode | null>(null);
  const [publishingLocale, setPublishingLocale] = useState<LocaleCode | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (moduleFilter !== "all") params.set("module", moduleFilter);

      const response = await fetch(`/api/admin/i18n/keys?${params.toString()}`, {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || t("errors.loadKeys"));
        return;
      }

      setKeys(data.keys ?? []);
      setModules(data.modules ?? []);

      const nextSelectedKey = selectedKey && data.keys?.some((item: TranslationKeyItem) => item.key_path === selectedKey)
        ? selectedKey
        : data.keys?.[0]?.key_path ?? null;

      setSelectedKey(nextSelectedKey);
    } catch (error) {
      console.error(error);
      toast.error(t("errors.loadKeys"));
    } finally {
      setLoadingKeys(false);
    }
  }, [moduleFilter, search, selectedKey, t]);

  const fetchDetail = useCallback(async (keyPath: string) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/admin/i18n/values?keyPath=${encodeURIComponent(keyPath)}`, {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || t("errors.loadDetail"));
        return;
      }

      setDetail(data);
      setDraftValues({
        es: data.locales.es.draftValue ?? data.locales.es.publishedValue ?? data.locales.es.baseValue,
        en: data.locales.en.draftValue ?? data.locales.en.publishedValue ?? data.locales.en.baseValue,
        fr: data.locales.fr.draftValue ?? data.locales.fr.publishedValue ?? data.locales.fr.baseValue,
      });
    } catch (error) {
      console.error(error);
      toast.error(t("errors.loadDetail"));
    } finally {
      setLoadingDetail(false);
    }
  }, [t]);

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }

    void fetchKeys();
  }, [fetchKeys, user?.role]);

  useEffect(() => {
    if (!selectedKey || user?.role !== "admin") {
      setDetail(null);
      return;
    }

    void fetchDetail(selectedKey);
  }, [fetchDetail, selectedKey, user?.role]);

  const selectedKeyMeta = useMemo(
    () => keys.find((item) => item.key_path === selectedKey) ?? null,
    [keys, selectedKey],
  );

  const saveDraft = async (locale: LocaleCode) => {
    if (!detail) {
      return;
    }

    setSavingLocale(locale);
    try {
      const response = await fetch("/api/admin/i18n/values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          keyPath: detail.key.keyPath,
          locale,
          valueText: draftValues[locale],
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || t("errors.saveDraft"));
        return;
      }

      toast.success(t("savedDraft"));
      await fetchDetail(detail.key.keyPath);
    } catch (error) {
      console.error(error);
      toast.error(t("errors.saveDraft"));
    } finally {
      setSavingLocale(null);
    }
  };

  const publishDraft = async (locale: LocaleCode) => {
    if (!detail) {
      return;
    }

    setPublishingLocale(locale);
    try {
      const response = await fetch("/api/admin/i18n/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ keyPath: detail.key.keyPath, locale }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || t("errors.publish"));
        return;
      }

      toast.success(t("published"));
      await fetchDetail(detail.key.keyPath);
    } catch (error) {
      console.error(error);
      toast.error(t("errors.publish"));
    } finally {
      setPublishingLocale(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <EmptyState icon={ShieldAlert} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("helperText")}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300">
          <Languages className="h-3.5 w-3.5" />
          {keys.length} {t("keysCount")}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-gray-200 dark:border-slate-800">
          <CardHeader className="space-y-4">
            <CardTitle className="text-base">{t("catalogTitle")}</CardTitle>
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="pl-9"
                />
              </div>
              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="all">{t("allModules")}</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {!loadingKeys && keys.length === 0 ? (
              <EmptyState icon={Languages} title={t("emptyTitle")} description={t("emptyDescription")} />
            ) : (
              <div className="relative">
                {loadingKeys && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/70 backdrop-blur-[2px] transition-opacity">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                  </div>
                )}
                <div className={`max-h-[70vh] space-y-2 overflow-y-auto pr-1 transition-opacity duration-200 ${loadingKeys ? "opacity-40" : "opacity-100"}`}>
                {keys.map((item) => {
                  const active = item.key_path === selectedKey;
                  const previewText = item.base_es || item.base_en || item.base_fr || t("emptyValue");

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedKey(item.key_path)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                        active
                          ? "border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-700/20"
                          : "border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{item.display_name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">{previewText}</p>
                          <p className="mt-2 truncate text-[11px] text-gray-400 dark:text-gray-400">{item.key_path}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 dark:bg-slate-700 dark:text-gray-100">{item.module_label}</Badge>
                      </div>
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedKeyMeta ? selectedKeyMeta.key_path : t("editorTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedKey ? (
              <EmptyState icon={Languages} title={t("selectKeyTitle")} description={t("selectKeyDescription")} />
            ) : loadingDetail || !detail ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              </div>
            ) : (
              <Tabs defaultValue="es" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {locales.map((locale) => (
                    <TabsTrigger key={locale} value={locale} className="uppercase">
                      {locale}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {locales.map((locale) => {
                  const localeData = detail.locales[locale];
                  const hasDraft = Boolean(localeData.draftValue);
                  const hasPublished = Boolean(localeData.publishedValue);

                  return (
                    <TabsContent key={locale} value={locale} className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{t("baseLabel")}</Badge>
                        {hasPublished && <Badge>{t("publishedLabel")}</Badge>}
                        {hasDraft && <Badge variant="outline">{t("draftLabel")}</Badge>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          {t("editableValue")} ({locale.toUpperCase()})
                        </label>
                        <textarea
                          value={draftValues[locale]}
                          onChange={(event) =>
                            setDraftValues((current) => ({
                              ...current,
                              [locale]: event.target.value,
                            }))
                          }
                          placeholder={t("textareaPlaceholder")}
                          className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => saveDraft(locale)}
                          disabled={savingLocale === locale}
                          className="bg-brand-600 hover:bg-brand-700"
                        >
                          {savingLocale === locale ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          {t("saveDraft")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => publishDraft(locale)}
                          disabled={publishingLocale === locale || !localeData.draftValue}
                        >
                          {publishingLocale === locale ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                          {t("publish")}
                        </Button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t("baseLabel")}</p>
                          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{localeData.baseValue || t("emptyValue")}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t("publishedLabel")}</p>
                          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{localeData.publishedValue || t("emptyValue")}</p>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
