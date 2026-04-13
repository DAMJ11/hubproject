"use client";

import { Heart, Eye, Calendar, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DesignCardProps {
  item: {
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
  };
  liked?: boolean;
  onToggleLike?: (id: number) => void;
}

export default function DesignCard({ item, liked, onToggleLike }: DesignCardProps) {
  const t = useTranslations("DesignMarketplace");

  const isBase64 = item.image_url?.startsWith("data:");
  const hasImage = !!item.image_url;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/design-marketplace/${item.id}`}>
        <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {hasImage ? (
            isBase64 ? (
              <img
                src={item.image_url!}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Image
                src={item.image_url!}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Calendar className="w-12 h-12" />
            </div>
          )}
          {/* Category badge */}
          <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
            {item.category}
          </span>
          {item.season && (
            <span className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 text-xs px-2 py-1 rounded-full">
              {item.season} {item.year || ""}
            </span>
          )}
        </div>
      </Link>
      <CardContent className="p-3">
        <Link href={`/design-marketplace/${item.id}`}>
          <h3 className="font-semibold text-sm line-clamp-1 hover:text-amber-600 transition-colors">
            {item.title}
          </h3>
        </Link>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/designers/${item.designer_slug}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-600 transition-colors"
          >
            {item.designer_avatar ? (
              <img
                src={item.designer_avatar}
                alt={item.designer_name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-[10px] font-bold text-amber-600">
                {item.designer_name?.charAt(0)}
              </div>
            )}
            <span className="line-clamp-1">{item.designer_name}</span>
            {item.designer_verified && <BadgeCheck className="w-3 h-3 text-amber-600 flex-shrink-0" />}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {item.views_count}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleLike?.(item.id);
              }}
              className={`flex items-center gap-0.5 transition-colors ${
                liked ? "text-red-500" : "hover:text-red-500"
              }`}
              title={liked ? t("unlike") : t("like")}
            >
              <Heart className={`w-3 h-3 ${liked ? "fill-red-500" : ""}`} /> {item.likes_count}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
