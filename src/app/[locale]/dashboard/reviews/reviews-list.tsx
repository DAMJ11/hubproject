"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Star, Search, ThumbsUp, MessageSquare } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import type { ReviewItem } from "@/lib/data/reviews";

interface ReviewsListProps {
  reviews: ReviewItem[];
  isAdmin: boolean;
}

export default function ReviewsList({ reviews, isAdmin }: ReviewsListProps) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard:reviews:filters");
      if (!saved) return;

      const parsed = JSON.parse(saved) as { searchQuery?: string; filterRating?: number };
      if (typeof parsed.searchQuery === "string") setSearchQuery(parsed.searchQuery);
      if (typeof parsed.filterRating === "number") setFilterRating(parsed.filterRating);
    } catch {
      // Ignore malformed persisted state.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard:reviews:filters", JSON.stringify({ searchQuery, filterRating }));
  }, [searchQuery, filterRating]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const filtered = reviews.filter((r) => {
    const matchSearch = `${r.client_name} ${r.professional_name} ${r.service_name} ${r.comment}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRating = filterRating === 0 || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? t("titleAdmin") : t("titleUser")}</h1>
          <p className="text-gray-500 mt-1">{isAdmin ? t("subtitleAdmin") : t("subtitleUser")}</p>
        </div>
        <Card className="px-4 py-2 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-bold">{avgRating}</span>
          <span className="text-sm text-gray-500">/ 5.0 ({t("reviewCount", { count: reviews.length })})</span>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant={filterRating === 0 ? "default" : "outline"} size="sm" onClick={() => setFilterRating(0)}
            className={filterRating === 0 ? "bg-brand-600 hover:bg-brand-700" : ""}>{t("all")}</Button>
          {[5, 4, 3, 2, 1].map((r) => (
            <Button key={r} variant={filterRating === r ? "default" : "outline"} size="sm" onClick={() => setFilterRating(r)}
              className={filterRating === r ? "bg-brand-600 hover:bg-brand-700" : ""}>
              {r} <Star className="w-3 h-3 ml-1 fill-current" />
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <EmptyState
            icon={Star}
            title={reviews.length === 0 ? t("emptyNoReviews") : t("emptyFiltered")}
            description={reviews.length === 0 ? t("emptyNoReviewsHint") : t("emptyFilteredHint")}
            action={(searchQuery || filterRating !== 0) ? {
              label: t("clearFilters"),
              onClick: () => { setSearchQuery(""); setFilterRating(0); },
            } : undefined}
          />
        )}
        {filtered.map((review) => (
          <Card key={review.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  {review.client_name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.client_name}</p>
                  <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{review.service_name}</span>
              <span className="text-xs text-gray-400 mx-2">&bull;</span>
              <span className="text-xs text-gray-500">{t("specialist", { name: review.professional_name })}</span>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t">
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600">
                <ThumbsUp className="w-3.5 h-3.5" /> {t("useful")}
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600">
                <MessageSquare className="w-3.5 h-3.5" /> {t("reply")}
              </button>
              {!review.is_public && (
                <span className="text-xs text-brand-600 ml-auto">{t("private")}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
