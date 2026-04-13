"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Heart, Eye, BadgeCheck, ArrowLeft, Calendar, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DesignDetail {
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
  designer_profile_id: number;
  designer_name: string;
  designer_slug: string;
  designer_avatar?: string | null;
  designer_bio?: string | null;
  designer_verified?: boolean;
  designer_specialties?: string | null;
  location_city?: string | null;
  location_country?: string | null;
}

interface RelatedItem {
  id: number;
  title: string;
  image_url?: string | null;
  category: string;
  likes_count: number;
}

export default function DesignDetailClient({ itemId }: { itemId: number }) {
  const t = useTranslations("DesignMarketplace");
  const router = useRouter();
  const [item, setItem] = useState<DesignDetail | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/design-marketplace/${itemId}`);
      const data = await res.json();
      if (data.success) {
        setItem(data.data);
        setRelated(data.relatedItems || []);
      } else {
        toast.error(t("notFound"));
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [itemId, t]);

  const checkLike = useCallback(async () => {
    try {
      const res = await fetch(`/api/design-likes?itemIds=${itemId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLiked(data.data.includes(itemId));
      }
    } catch {
      // silent
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetail();
    checkLike();
  }, [fetchDetail, checkLike]);

  const toggleLike = async () => {
    try {
      const res = await fetch("/api/design-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioItemId: itemId }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) toast.error(t("loginToLike"));
        return;
      }
      setLiked(data.liked);
      if (item) {
        setItem({ ...item, likes_count: item.likes_count + (data.liked ? 1 : -1) });
      }
    } catch {
      toast.error(t("fetchError"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium">{t("notFound")}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/design-marketplace")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("backToMarketplace")}
        </Button>
      </div>
    );
  }

  const parsedTags: string[] = (() => {
    try {
      return item.tags ? JSON.parse(item.tags) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="container-custom mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/design-marketplace")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {t("backToMarketplace")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main image */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full max-h-[700px] object-contain"
              />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-400">
                <Calendar className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                {item.category}
              </span>
              {item.season && (
                <span className="text-xs text-muted-foreground">
                  {item.season} {item.year || ""}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            {item.description && (
              <p className="text-muted-foreground mt-2">{item.description}</p>
            )}
          </div>

          {/* Stats + like */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" /> {item.views_count}
            </span>
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} /> {item.likes_count}
            </button>
          </div>

          {/* Tags */}
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {parsedTags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Designer info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">{t("designerInfo")}</h3>
              <Link
                href={`/designers/${item.designer_slug}`}
                className="flex items-center gap-3 hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors"
              >
                {item.designer_avatar ? (
                  <img
                    src={item.designer_avatar}
                    alt={item.designer_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-sm font-bold text-amber-600">
                    {item.designer_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 font-medium">
                    {item.designer_name}
                    {item.designer_verified && <BadgeCheck className="w-4 h-4 text-amber-600" />}
                  </div>
                  {(item.location_city || item.location_country) && (
                    <p className="text-xs text-muted-foreground">
                      {[item.location_city, item.location_country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </Link>
              {item.designer_bio && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{item.designer_bio}</p>
              )}
              <Link href={`/designers/${item.designer_slug}`}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <ExternalLink className="w-3 h-3 mr-2" /> {t("viewProfile")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {t("postedOn")} {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Related designs */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">{t("moreFromDesigner")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/design-marketplace/${r.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs font-medium line-clamp-1">{r.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
