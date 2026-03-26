"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Factory, Search, CheckCircle, MapPin, Users, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { CompanyItem } from "@/lib/data/companies";

const typeLabels: Record<string, { color: string }> = {
  brand: { color: "bg-purple-100 text-purple-700" },
  manufacturer: { color: "bg-teal-100 text-teal-700" },
};

const descriptionMap: Record<string, { en: string; fr: string }> = {
  "Marca de moda femenina casual con enfoque en tendencias contemporaneas.": {
    en: "Casual womenswear brand focused on contemporary trends.",
    fr: "Marque de mode feminine casual axee sur les tendances contemporaines.",
  },
  "Streetwear urbano para hombres. Hoodies, joggers y camisetas oversize.": {
    en: "Urban mens streetwear. Hoodies, joggers and oversized t-shirts.",
    fr: "Streetwear urbain pour hommes. Hoodies, joggers et t-shirts oversize.",
  },
  "Moda sostenible femenina. Materiales organicos y procesos eticos.": {
    en: "Sustainable womens fashion. Organic materials and ethical processes.",
    fr: "Mode feminine durable. Materiaux organiques et processus ethiques.",
  },
  "Laboratorio de moda urbana. Drops limitados y colaboraciones.": {
    en: "Urban fashion lab. Limited drops and collaborations.",
    fr: "Laboratoire de mode urbaine. Drops limites et collaborations.",
  },
  "Alta costura y vestidos de gala. Diseno exclusivo para eventos.": {
    en: "Haute couture and evening gowns. Exclusive design for events.",
    fr: "Haute couture et robes de gala. Design exclusif pour evenements.",
  },
  "Planta de confeccion con experiencia en tejido plano y punto.": {
    en: "Manufacturing plant experienced in woven and knit garments.",
    fr: "Usine de confection experimentee en tissus tisses et mailles.",
  },
  "Taller especializado en moda sostenible.": {
    en: "Workshop specialized in sustainable fashion.",
    fr: "Atelier specialise dans la mode durable.",
  },
  "Fabrica urbana de moda rapida y streetwear.": {
    en: "Urban factory for fast fashion and streetwear.",
    fr: "Usine urbaine de fast fashion et streetwear.",
  },
  "Textiles reciclados con certificaciones internacionales.": {
    en: "Recycled textiles with international certifications.",
    fr: "Textiles recycles avec certifications internationales.",
  },
};

const cityStateMap: Record<string, { en: string; fr: string }> = {
  "Bogota, Cundinamarca": { en: "Bogota, Cundinamarca", fr: "Bogota, Cundinamarca" },
  "Medellin, Antioquia": { en: "Medellin, Antioquia", fr: "Medellin, Antioquia" },
  "Cali, Valle del Cauca": { en: "Cali, Valle del Cauca", fr: "Cali, Valle del Cauca" },
  "Pereira, Risaralda": { en: "Pereira, Risaralda", fr: "Pereira, Risaralda" },
};

export default function CompaniesList({ companies, initialType }: { companies: CompanyItem[]; initialType: string }) {
  const t = useTranslations("Companies");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const typeFilter = searchParams.get("type") ?? initialType;

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    router.push(`?${params.toString()}`);
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const getTypeLabel = (type: "brand" | "manufacturer") => {
    if (type === "brand") return t("typeBrand");
    return t("typeManufacturer");
  };

  const getTranslatedDescription = (description: string | null) => {
    if (!description || locale === "es") return description;
    const found = descriptionMap[description];
    if (!found) return description;
    return found[locale as "en" | "fr"] ?? description;
  };

  const getTranslatedLocation = (city: string | null, state: string | null) => {
    if (!city) return "";
    const key = `${city}, ${state ?? ""}`.replace(/,\s*$/, "");
    if (locale === "es") return key;
    const found = cityStateMap[key];
    return found ? (found[locale as "en" | "fr"] ?? key) : key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
        >
          <option value="">{t("filterAll")}</option>
          <option value="brand">{t("filterBrands")}</option>
          <option value="manufacturer">{t("filterManufacturers")}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("total")}</p>
          <p className="text-2xl font-bold">{companies.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("brands")}</p>
          <p className="text-2xl font-bold text-purple-600">{companies.filter(c => c.type === "brand").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t("manufacturers")}</p>
          <p className="text-2xl font-bold text-teal-600">{companies.filter(c => c.type === "manufacturer").length}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Factory} title={t("empty")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => {
            const badge = typeLabels[company.type] || typeLabels.brand;
            return (
              <div
                key={company.id}
                className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                      <Factory className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {company.name}
                        {company.is_verified && <CheckCircle className="w-4 h-4 text-brand-600" />}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                        {getTypeLabel(company.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {company.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{getTranslatedDescription(company.description)}</p>
                )}

                <div className="space-y-1.5 text-xs text-gray-400">
                  {company.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {getTranslatedLocation(company.city, company.state)}
                    </div>
                  )}
                  {company.employee_count && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {company.employee_count} {t("employeesSuffix")}
                    </div>
                  )}
                  {company.founded_year && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {t("foundedPrefix")} {company.founded_year}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
