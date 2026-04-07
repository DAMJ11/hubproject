"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Building2, CheckCircle2, Filter, Loader2, MessageSquare, Package, Plane, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/skeleton-loader";
import { Link } from "@/i18n/navigation";

interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  country: string;
  isVerified: boolean;
  employeeCount: string | null;
  foundedYear: number | null;
  certificationsCount: number;
  verifiedCertificationsCount: number;
  awardedProjectsCount: number;
  capabilities: string[];
  minMoq: number | null;
  serviceMode: "design_only" | "production_only" | "design_and_production" | "not_defined";
  shipsWorldwide: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function ManufacturersList({
  userRole,
  categories: initialCategories,
}: {
  userRole: string;
  categories: Category[];
}) {
  const t = useTranslations("Manufacturers");
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [moqTier, setMoqTier] = useState<"all" | "1" | "10" | "50">("1");
  const [shipping, setShipping] = useState<"all" | "international">("international");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  const canContactManufacturers = userRole === "brand" || userRole === "admin";
  const hasLoadedOnceRef = useRef(false);

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    location: "",
    categoryId: 0,
    moqTier: "1" as "all" | "1" | "10" | "50",
    shipping: "international" as "all" | "international",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        search,
        location,
        categoryId,
        moqTier,
        shipping,
      });
      setPage(1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [search, location, categoryId, moqTier, shipping]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (debouncedFilters.search.trim()) params.set("q", debouncedFilters.search.trim());
    if (debouncedFilters.location.trim()) params.set("location", debouncedFilters.location.trim());
    if (debouncedFilters.categoryId) params.set("categoryId", String(debouncedFilters.categoryId));
    if (debouncedFilters.moqTier !== "all") params.set("moqTier", debouncedFilters.moqTier);
    if (debouncedFilters.shipping !== "all") params.set("shipping", debouncedFilters.shipping);
    return params.toString();
  }, [debouncedFilters, page]);

  const locationOptions = useMemo(() => {
    const values = new Set<string>();
    for (const item of manufacturers) {
      if (item.country) values.add(item.country);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [manufacturers]);

  const loadManufacturers = useCallback(async () => {
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const manufacturersRes = await fetch(`/api/manufacturers?${queryString}`, { cache: "no-store" });
      const manufacturersData = await manufacturersRes.json();

      if (!manufacturersData.success) {
        setError(manufacturersData.message || t("errorLoading"));
        setManufacturers([]);
        return;
      }

      setManufacturers(manufacturersData.data ?? []);
      setTotalPages(Number(manufacturersData.totalPages ?? 1));
      hasLoadedOnceRef.current = true;
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [queryString, t]);

  useEffect(() => {
    loadManufacturers();
  }, [loadManufacturers]);

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setCategoryId(0);
    setMoqTier("all");
    setShipping("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">{t("subtitleTop")}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      {userRole && userRole !== "brand" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t("brandOnlyBanner")}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Filter className="h-4 w-4" /> {t("filters")}
          {isRefreshing && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-brand-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("updating")}
            </span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative xl:col-span-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchByBrandKeywordOrLocation")}
              className="pl-9"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand-600 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value={0}>{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand-600 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">{t("allLocations")}</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={resetFilters} className="h-10 w-full">
              {t("clearFilters")}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {([
            { value: "1", label: t("moqMin1") },
            { value: "10", label: t("moqMin10") },
            { value: "50", label: t("moqMin50") },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMoqTier(option.value)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                moqTier === option.value
                  ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShipping((prev) => (prev === "international" ? "all" : "international"))}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              shipping === "international"
                ? "border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            {shipping === "international" ? t("shippingInternational") : t("shippingAny")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : manufacturers.length === 0 ? (
        <EmptyState icon={Building2} title={t("noResults")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {manufacturers.map((manufacturer) => {
            const chatParams = new URLSearchParams({
              targetCompanyId: String(manufacturer.id),
              subject: t("chatSubject", { name: manufacturer.name }),
              message: t("chatMessage", { name: manufacturer.name }),
            });

            return (
              <div
                key={manufacturer.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                      {manufacturer.logoUrl ? (
                        <Image src={manufacturer.logoUrl} alt={manufacturer.name} width={48} height={48} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{manufacturer.name}</h3>
                        {manufacturer.isVerified && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                      </div>
                      <p className="text-xs text-gray-500">
                        {[manufacturer.city, manufacturer.state, manufacturer.country].filter(Boolean).join(" · ") || t("locationNA")}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {t("awarded", { count: manufacturer.awardedProjectsCount })}
                  </span>
                </div>

                <p className="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                  {manufacturer.description || t("noDescription")}
                </p>

                {manufacturer.capabilities.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {manufacturer.capabilities.slice(0, 4).map((capability, idx) => {
                      const color = [
                        "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
                        "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
                        "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200",
                        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
                      ][idx % 4];
                      return (
                        <span key={capability} className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
                          {capability}
                        </span>
                      );
                    })}
                    {manufacturer.capabilities.length > 4 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        +{manufacturer.capabilities.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {manufacturer.serviceMode === "design_only"
                      ? t("modeDesignOnly")
                      : manufacturer.serviceMode === "production_only"
                      ? t("modeProductionOnly")
                      : manufacturer.serviceMode === "design_and_production"
                      ? t("modeDesignAndProduction")
                      : t("modeNotDefined")}
                  </span>
                  {manufacturer.minMoq ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                      {t("offerMoq", { qty: manufacturer.minMoq })}
                    </span>
                  ) : null}
                  {manufacturer.shipsWorldwide ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                      <Plane className="h-3 w-3" /> {t("shipsWorldwide")}
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  {canContactManufacturers ? (
                    <Link href={`/dashboard/messages?${chatParams.toString()}`}>
                      <Button className="w-full bg-brand-600 text-white hover:bg-brand-700">
                        <MessageSquare className="mr-2 h-4 w-4" /> {t("requestQuote")}
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      {t("contactBrandOnly")}
                    </Button>
                  )}

                  <Link href={`/dashboard/manufacturers?q=${encodeURIComponent(manufacturer.name)}`}>
                    <Button type="button" variant="outline" className="w-full">
                      {t("viewProfile")}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            {t("previous")}
          </Button>
          <span className="text-sm text-gray-500">{t("pageOf", { page, total: totalPages })}</span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {t("next")}
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4" />
          <p>
            {t("tip")}
          </p>
        </div>
      </div>
    </div>
  );
}
