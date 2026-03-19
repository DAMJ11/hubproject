"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ruler, Shirt, Factory, Clock3, Move, Layers, Tag, User, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  es: {
    pill: "Moda hecha para escalar",
    titleA: "Conecta tu marca con",
    titleB: "fabricantes",
    titleC: "listos para producir",
    subtitle:
      "Diseña colecciones, publica pedidos y coordina producción entre brands y manufacturers en un solo flujo. Desde muestra hasta entrega final, con trazabilidad y comunicación en tiempo real.",
    highlights: [
      "Tech packs y tallaje estandarizado",
      "Muestras con feedback centralizado",
      "Fabricantes verificados por categoría",
      "Seguimiento de producción por hitos",
    ],
    ctaPrimary: "Publicar mi primer pedido",
    ctaSecondary: "Ver flujo de trabajo",
    stats: ["Manufacturers activos", "Ordenes gestionadas", "Entrega on-time"],
    categories: ["Streetwear", "Denim", "Activewear", "Outerwear", "Womenswear", "Accesorios"],
    categoryDesc: [
      "Cortes oversize, bordado y serigrafia",
      "Lavados, fit tecnico y acabados premium",
      "Telas tecnicas y costuras de alto rendimiento",
      "Chaquetas, padding y procesos impermeables",
      "Patronaje, confección fina y acabados boutique",
      "Gorras, bags y desarrollo de trims",
    ],
  },
  en: {
    pill: "Fashion built to scale",
    titleA: "Connect your brand with",
    titleB: "manufacturers",
    titleC: "ready to produce",
    subtitle:
      "Design collections, publish orders, and coordinate production between brands and manufacturers in one flow. From sample to final delivery with full traceability and real-time communication.",
    highlights: [
      "Standardized tech packs and sizing",
      "Samples with centralized feedback",
      "Verified manufacturers by category",
      "Milestone-based production tracking",
    ],
    ctaPrimary: "Publish my first order",
    ctaSecondary: "See workflow",
    stats: ["Active manufacturers", "Orders managed", "On-time delivery"],
    categories: ["Streetwear", "Denim", "Activewear", "Outerwear", "Womenswear", "Accessories"],
    categoryDesc: [
      "Oversized cuts, embroidery and screen-print",
      "Washes, technical fit and premium finishes",
      "Technical fabrics and high-performance seams",
      "Jackets, padding and waterproof processes",
      "Pattern making, fine confection and boutique finish",
      "Caps, bags and trims development",
    ],
  },
  fr: {
    pill: "Mode concue pour passer a l'echelle",
    titleA: "Connectez votre marque avec des",
    titleB: "fabricants",
    titleC: "prets a produire",
    subtitle:
      "Concevez des collections, publiez des commandes et coordonnez la production entre marques et fabricants dans un seul flux. Du prototype a la livraison finale, avec tracabilite et communication en temps reel.",
    highlights: [
      "Tech packs et taillage standardise",
      "Echantillons avec feedback centralise",
      "Fabricants verifies par categorie",
      "Suivi de production par jalons",
    ],
    ctaPrimary: "Publier ma premiere commande",
    ctaSecondary: "Voir le workflow",
    stats: ["Fabricants actifs", "Commandes gerees", "Livraison a temps"],
    categories: ["Streetwear", "Denim", "Activewear", "Outerwear", "Womenswear", "Accessoires"],
    categoryDesc: [
      "Coupes oversize, broderie et serigraphie",
      "Lavages, fit technique et finitions premium",
      "Tissus techniques et coutures performance",
      "Vestes, padding et process impermeables",
      "Patronage, confection fine et finitions boutique",
      "Casquettes, sacs et developpement de trims",
    ],
  },
};

const categoryIcons = [
  Shirt,    // Camisetas y tops
  Tag,      // Private label
  Move,     // Activewear
  Layers,   // Outerwear
  Tag,      // Vestidos y sets
  User      // Accesorios
];
const categoryColors = [
  "bg-amber-50 border-amber-100",
  "bg-sky-50 border-sky-100",
  "bg-emerald-50 border-emerald-100",
  "bg-stone-100 border-stone-200",
  "bg-rose-50 border-rose-100",
  "bg-violet-50 border-violet-100",
];

export default function Hero() {
  const { language } = useLanguage();
  const t = content[language];

  const highlights = [
    { icon: Ruler, text: t.highlights[0] },
    { icon: Shirt, text: t.highlights[1] },
    { icon: Factory, text: t.highlights[2] },
    { icon: Clock3, text: t.highlights[3] },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f6fbfb] via-[#fff] to-[#eef2ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 text-[#1d4ed8] rounded-full px-4 py-2 text-sm font-medium mb-6">
              <span>👟</span> {t.pill}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-[#1f2937] leading-tight">
              {t.titleA} <span className="text-[#2563eb]">{t.titleB}</span> {t.titleC}
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg">{t.subtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon className="w-5 h-5 text-[#2563eb]" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-8 h-12 text-base">
                  {t.ctaPrimary}
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg px-8 h-12 text-base border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/5"
                >
                  {t.ctaSecondary}
                </Button>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1f2937]">250+</p>
                <p className="text-xs text-gray-500">{t.stats[0]}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1f2937]">1.2K+</p>
                <p className="text-xs text-gray-500">{t.stats[1]}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1f2937]">92%</p>
                <p className="text-xs text-gray-500">{t.stats[2]}</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {t.categories.map((name, idx) => {
                const Icon = categoryIcons[idx];
                return (
                  <div key={name} className={`${categoryColors[idx]} border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                    <Icon className="w-8 h-8 mx-auto mb-3 text-[#2563eb]" />
                    <h3 className="font-semibold text-gray-900 mt-3">{name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.categoryDesc[idx]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

