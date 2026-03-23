"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Shirt, Factory, Clock3, Move, Layers, Tag, User, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Hero");

  const highlights = [
    { icon: CheckCircle2, text: t("highlights.0") },
    { icon: CheckCircle2, text: t("highlights.1") },
    { icon: CheckCircle2, text: t("highlights.2") },
    { icon: CheckCircle2, text: t("highlights.3") },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f6fbfb] via-[#fff] to-[#eef2ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 text-[#1d4ed8] rounded-full px-4 py-2 text-sm font-medium mb-6">
              {t("pill")}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-[#1f2937] leading-tight">
              {t("titleA")} <span className="text-[#2563eb]">{t("titleB")}</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg">{t("subtitle")}</p>

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
                  {t("ctaPrimary")}
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg px-8 h-12 text-base border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/5"
                >
                  {t("ctaSecondary")}
                </Button>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {categoryIcons.map((Icon, idx) => (
                <div key={idx} className={`${categoryColors[idx]} border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                    <Icon className="w-8 h-8 mx-auto mb-3 text-[#2563eb]" />
                    <h3 className="font-semibold text-gray-900 mt-3">{t(`categories.${idx}`)}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t(`categoryDesc.${idx}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mt-12 flex justify-center gap-6">
          {[
            { value: "250+", color: "text-teal-500" },
            { value: "1,200+", color: "text-blue-500" },
            { value: "92%", color: "text-teal-500" },
          ].map((stat, idx) => (
            <div
              key={stat.value}
              className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl px-10 py-5 shadow-sm min-w-[160px]"
            >
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-sm text-gray-500 mt-1">{t(`stats.${idx}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

