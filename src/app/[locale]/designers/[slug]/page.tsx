import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  MapPin, Globe, Instagram, Star, Clock, CheckCircle, Briefcase,
  ExternalLink, Eye, Heart, Palette,
} from "lucide-react";

async function getDesignerBySlug(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/designers/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export default async function DesignerPublicProfile({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("DesignerPublicProfile");
  const designer = await getDesignerBySlug(slug);

  if (!designer) notFound();

  let specialties: string[] = [];
  try { specialties = JSON.parse(designer.specialties || "[]"); } catch { /* empty */ }

  const portfolioItems = designer.portfolio_items || [];

  const availabilityColors: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    busy: "bg-yellow-100 text-yellow-700",
    unavailable: "bg-red-100 text-red-700",
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-gradient-to-r from-amber-200 to-amber-100 dark:from-amber-900/30 dark:to-gray-900">
        {designer.cover_image_url && (
          <img src={designer.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="container-custom mx-auto px-4 -mt-16 relative z-10 pb-16">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {designer.avatar_url ? (
              <img src={designer.avatar_url} alt={designer.display_name} className="w-full h-full object-cover" />
            ) : (
              <Palette className="h-14 w-14 text-amber-500" />
            )}
          </div>
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{designer.display_name}</h1>
              {designer.is_verified && (
                <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-4 w-4" /> {t("verified")}
                </span>
              )}
              <span className={`text-sm px-3 py-0.5 rounded-full font-medium ${availabilityColors[designer.availability_status] || "bg-gray-100"}`}>
                {t(`availability.${designer.availability_status}`)}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              {(designer.location_city || designer.location_country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {[designer.location_city, designer.location_country].filter(Boolean).join(", ")}
                </span>
              )}
              {designer.years_experience && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {designer.years_experience} {t("yearsExp")}
                </span>
              )}
              {designer.projects_completed > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {designer.projects_completed} {t("projectsCompleted")}
                </span>
              )}
              {designer.rating_avg > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" /> {Number(designer.rating_avg).toFixed(1)} ({designer.total_reviews})
                </span>
              )}
            </div>

            {/* Bio */}
            {designer.bio && (
              <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">{designer.bio}</p>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {specialties.map((s: string) => (
                  <span key={s} className="px-3 py-1 rounded-full text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Rates */}
            {(designer.hourly_rate_min || designer.hourly_rate_max) && (
              <p className="mt-3 text-sm text-gray-500">
                💰 {designer.hourly_rate_min && `${designer.currency} ${designer.hourly_rate_min}`}
                {designer.hourly_rate_min && designer.hourly_rate_max && " – "}
                {designer.hourly_rate_max && `${designer.currency} ${designer.hourly_rate_max}`}
                {" "}{t("perHour")}
              </p>
            )}

            {/* Social links */}
            <div className="flex flex-wrap gap-3 mt-4">
              {designer.instagram_handle && (
                <a href={`https://instagram.com/${designer.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-600 transition">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              )}
              {designer.behance_url && (
                <a href={designer.behance_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
                  <ExternalLink className="h-4 w-4" /> Behance
                </a>
              )}
              {designer.dribbble_url && (
                <a href={designer.dribbble_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition">
                  <ExternalLink className="h-4 w-4" /> Dribbble
                </a>
              )}
              {designer.linkedin_url && (
                <a href={designer.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 transition">
                  <ExternalLink className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {designer.website_url && (
                <a href={designer.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition">
                  <Globe className="h-4 w-4" /> {t("website")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio */}
        {portfolioItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("portfolioTitle")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item: {
                id: number; title: string; description?: string; category: string;
                season?: string; year?: number; image_url?: string; tags?: string;
                views_count: number; likes_count: number;
              }) => {
                let tags: string[] = [];
                try { tags = JSON.parse(item.tags || "[]"); } catch { /* empty */ }
                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-52 bg-gray-100 dark:bg-gray-800">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Palette className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {item.category}{item.season && ` · ${item.season}`}{item.year && ` ${item.year}`}
                      </p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.slice(0, 4).map((tag: string) => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.views_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {item.likes_count}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
