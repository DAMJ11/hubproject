"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Filter, Loader2, MessageSquare, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

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
}

interface Category {
  id: number;
  name: string;
}

interface CapabilityOffer {
  id: number;
  category_name: string;
  min_order_qty: number;
  max_monthly_capacity: number | null;
  lead_time_days: number | null;
  unit_price_from: number | null;
  wholesale_price_from: number | null;
  commercial_notes: string | null;
  description: string | null;
}

interface MeResponse {
  user?: {
    role: string;
  };
}

export default function ManufacturersPage() {
  const t = useTranslations("Manufacturers");
  const locale = useLocale();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string>("");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyWithCerts, setOnlyWithCerts] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  const canContactManufacturers = role === "brand" || role === "admin";
  const hasLoadedOnceRef = useRef(false);
  const [expandedOfferCompanyId, setExpandedOfferCompanyId] = useState<number | null>(null);
  const [offersByCompany, setOffersByCompany] = useState<Record<number, CapabilityOffer[]>>({});
  const [offersLoadingCompanyId, setOffersLoadingCompanyId] = useState<number | null>(null);

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    city: "",
    categoryId: 0,
    onlyVerified: false,
    onlyWithCerts: false,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        search,
        city,
        categoryId,
        onlyVerified,
        onlyWithCerts,
      });
      setPage(1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [search, city, categoryId, onlyVerified, onlyWithCerts]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (debouncedFilters.search.trim()) params.set("q", debouncedFilters.search.trim());
    if (debouncedFilters.city.trim()) params.set("city", debouncedFilters.city.trim());
    if (debouncedFilters.categoryId) params.set("categoryId", String(debouncedFilters.categoryId));
    if (debouncedFilters.onlyVerified) params.set("verified", "true");
    if (debouncedFilters.onlyWithCerts) params.set("hasCertifications", "true");
    return params.toString();
  }, [debouncedFilters, page]);

  const loadManufacturers = useCallback(async () => {
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [meRes, categoriesRes, manufacturersRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
        fetch(`/api/manufacturers?${queryString}`, { cache: "no-store" }),
      ]);

      const meData = (await meRes.json()) as MeResponse;
      const categoriesData = await categoriesRes.json();
      const manufacturersData = await manufacturersRes.json();

      setRole(meData.user?.role ?? "");

      if (categoriesData.success) {
        setCategories(categoriesData.categories ?? []);
      }

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
    setCity("");
    setCategoryId(0);
    setOnlyVerified(false);
    setOnlyWithCerts(false);
    setPage(1);
  };

  const formatCOP = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

  const toggleOfferDetails = async (companyId: number) => {
    if (expandedOfferCompanyId === companyId) {
      setExpandedOfferCompanyId(null);
      return;
    }

    setExpandedOfferCompanyId(companyId);

    if (offersByCompany[companyId]) return;

    setOffersLoadingCompanyId(companyId);
    try {
      const res = await fetch(`/api/manufacturers/capabilities?companyId=${companyId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setOffersByCompany((prev) => ({ ...prev, [companyId]: data.data ?? [] }));
      }
    } catch {
      setOffersByCompany((prev) => ({ ...prev, [companyId]: [] }));
    } finally {
      setOffersLoadingCompanyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      {role && role !== "brand" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t("brandOnlyBanner")}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Filter className="h-4 w-4" /> {t("filters")}
          {isRefreshing && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-[#2563eb]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("updating")}
            </span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
            />
          </div>

          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("cityPlaceholder")}
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#2563eb] dark:border-slate-600 dark:bg-slate-900"
          >
            <option value={0}>{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={resetFilters} className="h-10 w-full">
              {t("clearFilters")}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]"
            />
            {t("onlyVerified")}
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={onlyWithCerts}
              onChange={(e) => setOnlyWithCerts(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]"
            />
            {t("withCertifications")}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : manufacturers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-800">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">{t("noResults")}</p>
        </div>
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
                        <img src={manufacturer.logoUrl} alt={manufacturer.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{manufacturer.name}</h3>
                        {manufacturer.isVerified && <CheckCircle2 className="h-4 w-4 text-[#2563eb]" />}
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

                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    {t("certifications", { count: manufacturer.certificationsCount })}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                    {t("verifiedCertifications", { count: manufacturer.verifiedCertificationsCount })}
                  </span>
                  {manufacturer.foundedYear && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {t("founded", { year: manufacturer.foundedYear })}
                    </span>
                  )}
                  {manufacturer.employeeCount && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {t("team", { size: manufacturer.employeeCount })}
                    </span>
                  )}
                </div>

                {manufacturer.capabilities.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {manufacturer.capabilities.slice(0, 5).map((capability) => (
                      <span key={capability} className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-600 dark:border-slate-600 dark:text-gray-300">
                        {capability}
                      </span>
                    ))}
                    {manufacturer.capabilities.length > 5 && (
                      <span className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-600 dark:border-slate-600 dark:text-gray-300">
                        +{manufacturer.capabilities.length - 5}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleOfferDetails(manufacturer.id)}
                  >
                    {expandedOfferCompanyId === manufacturer.id ? t("hideOffer") : t("showOffer")}
                  </Button>

                  {expandedOfferCompanyId === manufacturer.id && (
                    <div className="mt-2 rounded-lg border border-gray-200 p-3 dark:border-slate-600">
                      {offersLoadingCompanyId === manufacturer.id ? (
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("loadingOffer")}
                        </div>
                      ) : (offersByCompany[manufacturer.id]?.length ?? 0) === 0 ? (
                        <p className="text-xs text-gray-500">{t("noCapabilities")}</p>
                      ) : (
                        <div className="space-y-2">
                          {(offersByCompany[manufacturer.id] ?? []).map((offer) => (
                            <div key={offer.id} className="rounded-md bg-gray-50 p-2 dark:bg-slate-700/40">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{offer.category_name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                {t("offerMoq", { qty: offer.min_order_qty })}
                                {offer.max_monthly_capacity ? ` · ${t("offerCapacity", { qty: offer.max_monthly_capacity.toLocaleString() })}` : ""}
                                {offer.lead_time_days ? ` · ${t("offerDelivery", { days: offer.lead_time_days })}` : ""}
                              </p>
                              {(offer.unit_price_from !== null || offer.wholesale_price_from !== null) && (
                                <p className="text-xs text-blue-700 mt-1">
                                  {offer.unit_price_from !== null ? t("offerPriceFrom", { price: formatCOP(offer.unit_price_from) }) : ""}
                                  {offer.unit_price_from !== null && offer.wholesale_price_from !== null ? " · " : ""}
                                  {offer.wholesale_price_from !== null ? t("offerWholesaleFrom", { price: formatCOP(offer.wholesale_price_from) }) : ""}
                                </p>
                              )}
                              {offer.commercial_notes && (
                                <p className="text-xs text-gray-500 mt-1">{offer.commercial_notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {canContactManufacturers ? (
                  <Link href={`/dashboard/messages?${chatParams.toString()}`}>
                    <Button className="w-full bg-[#2563eb] text-white hover:bg-[#1d4ed8]">
                      <MessageSquare className="mr-2 h-4 w-4" /> {t("contactChat")}
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {t("contactBrandOnly")}
                  </Button>
                )}
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
