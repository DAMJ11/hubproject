"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Star, CheckCircle, Palette, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const SPECIALTIES = [
  { key: "collections", label: "Collections" },
  { key: "tech_packs", label: "Tech Packs" },
  { key: "patterns", label: "Patterns" },
  { key: "illustration", label: "Illustrations" },
  { key: "branding", label: "Branding" },
  { key: "consulting", label: "Consulting" },
];

interface DesignerCard {
  id: number;
  display_name: string;
  slug: string;
  bio: string | null;
  specialties: string | null;
  years_experience: number | null;
  location_city: string | null;
  location_country: string | null;
  availability_status: string;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  currency: string;
  is_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  projects_completed: number;
  is_freelance: boolean;
  avatar_url: string | null;
  portfolio_count: number;
}

export default function DesignersDirectoryClient() {
  const t = useTranslations("DesignersDirectory");
  const [designers, setDesigners] = useState<DesignerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDesigners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (specialty) params.set("specialty", specialty);
      if (availability) params.set("availability", availability);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/designers?${params}`);
      const data = await res.json();
      if (data.success) {
        setDesigners(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching designers:", err);
    } finally {
      setLoading(false);
    }
  }, [search, specialty, availability, page]);

  useEffect(() => { fetchDesigners(); }, [fetchDesigners]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const availabilityColors: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    busy: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10"
          />
        </div>
        <select
          value={availability}
          onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
        >
          <option value="">{t("allAvailability")}</option>
          <option value="available">{t("available")}</option>
          <option value="busy">{t("busy")}</option>
        </select>
      </div>

      {/* Specialty filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSpecialty(""); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !specialty ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("all")}
        </button>
        {SPECIALTIES.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSpecialty(s.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              specialty === s.key ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : designers.length === 0 ? (
        <div className="text-center py-16">
          <Palette className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-500">{t("noResults")}</h3>
          <p className="text-gray-400 text-sm">{t("noResultsHint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designers.map((d) => {
            let specs: string[] = [];
            try { specs = JSON.parse(d.specialties || "[]"); } catch { /* empty */ }
            return (
              <Link key={d.id} href={`/designers/${d.slug}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {d.avatar_url ? (
                          <img src={d.avatar_url} alt={d.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <Palette className="h-7 w-7 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{d.display_name}</h3>
                          {d.is_verified && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {(d.location_city || d.location_country) && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" /> {[d.location_city, d.location_country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${availabilityColors[d.availability_status] || "bg-gray-100 text-gray-500"}`}>
                        {d.availability_status}
                      </span>
                    </div>

                    {d.bio && <p className="text-sm text-gray-500 mt-3 line-clamp-2">{d.bio}</p>}

                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {specs.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {specs.length > 3 && <span className="text-xs text-gray-400">+{specs.length - 3}</span>}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {d.rating_avg > 0 && (
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {Number(d.rating_avg).toFixed(1)}</span>
                      )}
                      {d.projects_completed > 0 && <span>{d.projects_completed} projects</span>}
                      {d.portfolio_count > 0 && <span>{d.portfolio_count} works</span>}
                      {(d.hourly_rate_min || d.hourly_rate_max) && (
                        <span>
                          {d.currency} {d.hourly_rate_min || "?"} – {d.hourly_rate_max || "?"}/h
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
