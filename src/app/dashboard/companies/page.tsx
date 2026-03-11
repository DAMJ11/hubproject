"use client";

import { useState, useEffect, useCallback } from "react";
import { Factory, Search, CheckCircle, Loader2, MapPin, Users, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface Company {
  id: number;
  name: string;
  slug: string;
  type: "brand" | "manufacturer";
  description: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  country: string;
  is_verified: boolean;
  employee_count: string | null;
  founded_year: number | null;
  created_at: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  brand: { label: "Marca", color: "bg-purple-100 text-purple-700" },
  manufacturer: { label: "Fabricante", color: "bg-teal-100 text-teal-700" },
};

const pageText = {
  es: {
    title: "Empresas",
    subtitle: "Gestion de marcas y fabricantes registrados",
    searchPlaceholder: "Buscar por nombre o ciudad...",
    filterAll: "Todas",
    filterBrands: "Marcas",
    filterManufacturers: "Fabricantes",
    total: "Total",
    brands: "Marcas",
    manufacturers: "Fabricantes",
    empty: "No se encontraron empresas",
    employeesSuffix: "empleados",
    foundedPrefix: "Fundada en",
    typeBrand: "Marca",
    typeManufacturer: "Fabricante",
  },
  en: {
    title: "Companies",
    subtitle: "Management of registered brands and manufacturers",
    searchPlaceholder: "Search by name or city...",
    filterAll: "All",
    filterBrands: "Brands",
    filterManufacturers: "Manufacturers",
    total: "Total",
    brands: "Brands",
    manufacturers: "Manufacturers",
    empty: "No companies found",
    employeesSuffix: "employees",
    foundedPrefix: "Founded in",
    typeBrand: "Brand",
    typeManufacturer: "Manufacturer",
  },
  fr: {
    title: "Entreprises",
    subtitle: "Gestion des marques et fabricants enregistres",
    searchPlaceholder: "Rechercher par nom ou ville...",
    filterAll: "Toutes",
    filterBrands: "Marques",
    filterManufacturers: "Fabricants",
    total: "Total",
    brands: "Marques",
    manufacturers: "Fabricants",
    empty: "Aucune entreprise trouvee",
    employeesSuffix: "employes",
    foundedPrefix: "Fondee en",
    typeBrand: "Marque",
    typeManufacturer: "Fabricant",
  },
} as const;

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

export default function CompaniesPage() {
  const { language } = useLanguage();
  const t = pageText[language];
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/companies?${params}`);
      const data = await res.json();
      if (data.success) setCompanies(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const getTypeLabel = (type: "brand" | "manufacturer") => {
    if (type === "brand") return t.typeBrand;
    return t.typeManufacturer;
  };

  const getTranslatedDescription = (description: string | null) => {
    if (!description || language === "es") return description;
    const found = descriptionMap[description];
    if (!found) return description;
    return found[language];
  };

  const getTranslatedLocation = (city: string | null, state: string | null) => {
    if (!city) return "";
    const key = `${city}, ${state ?? ""}`.replace(/,\s*$/, "");
    if (language === "es") return key;
    const found = cityStateMap[key];
    return found ? found[language] : key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
        >
          <option value="">{t.filterAll}</option>
          <option value="brand">{t.filterBrands}</option>
          <option value="manufacturer">{t.filterManufacturers}</option>
        </select>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t.total}</p>
          <p className="text-2xl font-bold">{companies.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t.brands}</p>
          <p className="text-2xl font-bold text-purple-600">{companies.filter(c => c.type === "brand").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">{t.manufacturers}</p>
          <p className="text-2xl font-bold text-teal-600">{companies.filter(c => c.type === "manufacturer").length}</p>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <Factory className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t.empty}</p>
        </div>
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
                        {company.is_verified && <CheckCircle className="w-4 h-4 text-[#2563eb]" />}
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
                      {company.employee_count} {t.employeesSuffix}
                    </div>
                  )}
                  {company.founded_year && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {t.foundedPrefix} {company.founded_year}
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

