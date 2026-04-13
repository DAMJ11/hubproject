"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DesignCard from "./DesignCard";
import { toast } from "sonner";

interface MarketplaceItem {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  season?: string | null;
  year?: number | null;
  image_url?: string | null;
  tags?: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
  designer_name: string;
  designer_slug: string;
  designer_avatar?: string | null;
  designer_verified?: boolean;
}

const CATEGORIES = ["collections", "tech_packs", "patterns", "illustration", "branding", "consulting"];
const SEASONS = ["spring", "summer", "fall", "winter"];
const SORT_OPTIONS = ["recent", "popular", "views", "likes"];

export default function DesignMarketplaceClient() {
  const t = useTranslations("DesignMarketplace");
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [sort, setSort] = useState("recent");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (category) params.set("category", category);
      if (season) params.set("season", season);
      if (search) params.set("q", search);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/design-marketplace?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [page, category, season, search, sort, t]);

  const fetchLikes = useCallback(async (itemIds: number[]) => {
    if (itemIds.length === 0) return;
    try {
      const res = await fetch(`/api/design-likes?itemIds=${itemIds.join(",")}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLikedIds(new Set(data.data));
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (items.length > 0) {
      fetchLikes(items.map((i) => i.id));
    }
  }, [items, fetchLikes]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchItems();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleLike = async (itemId: number) => {
    try {
      const res = await fetch("/api/design-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioItemId: itemId }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          toast.error(t("loginToLike"));
        }
        return;
      }
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, likes_count: item.likes_count + (data.liked ? 1 : -1) }
            : item
        )
      );
    } catch {
      toast.error(t("fetchError"));
    }
  };

  return (
    <div className="container-custom mx-auto px-4 py-8">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">{t("allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`category_${c}`)}</option>
            ))}
          </select>
          <select
            value={season}
            onChange={(e) => { setSeason(e.target.value); setPage(1); }}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">{t("allSeasons")}</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{t(`season_${s}`)}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>{t(`sort_${s}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">{t("noResults")}</p>
          <p className="text-muted-foreground">{t("tryDifferentFilters")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <DesignCard
                key={item.id}
                item={item}
                liked={likedIds.has(item.id)}
                onToggleLike={toggleLike}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
