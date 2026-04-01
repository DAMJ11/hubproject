import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, PenLine, FileText, Search, Scissors, Cog, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import StatsCarousel from "@/components/StatsCarousel";

const categoryIcons = [PenLine, FileText, Search, Scissors, Cog, Sparkles];
const categoryColors = [
  "bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900",
  "bg-sky-50 border-sky-100 dark:bg-sky-950/40 dark:border-sky-900",
  "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900",
  "bg-stone-100 border-stone-200 dark:bg-stone-900/40 dark:border-stone-800",
  "bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900",
  "bg-violet-50 border-violet-100 dark:bg-violet-950/40 dark:border-violet-900",
];

export default async function Hero() {
  const t = await getTranslations("Hero");

  const highlights = [
    { icon: CheckCircle2, text: t("highlights.0") },
    { icon: CheckCircle2, text: t("highlights.1") },
    { icon: CheckCircle2, text: t("highlights.2") },
    { icon: CheckCircle2, text: t("highlights.3") },
  ];

  return (
    <section className="relative bg-gradient-to-br from-landing-light via-white to-brand-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
              {t("pill")}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-[#745E96] leading-tight">
              {t("titleA")}<br />
              {t("titleC")}<br />
              <span className="text-[#7e7cf3]">{t("titleB")}</span>
            </h1>

            <p className="mt-6 text-base lg:text-lg text-[#9279BA]">{t("subtitle")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-[#745E96]">
                    <Icon className="w-5 h-5 flex-shrink-0 text-brand-600" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-[#7e7cf3] hover:bg-[#6a68e0] text-white rounded-lg px-6 h-12 text-base">
                  {t("ctaPrimary")}
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg px-6 h-12 text-base border-[#7e7cf3] text-[#7e7cf3] hover:bg-[#7e7cf3]/5"
                >
                  {t("ctaSecondary")}
                </Button>
              </a>
            </div>

            {/* Grid 2x3 de etapas — solo móvil */}
            <div className="lg:hidden mt-8 grid grid-cols-3 gap-2">
              {categoryIcons.map((Icon, idx) => (
                <div
                  key={idx}
                  className={`${categoryColors[idx]} border rounded-xl p-3 flex flex-col items-center text-center`}
                >
                  <Icon className="w-5 h-5 text-brand-600 mb-1.5" />
                  <span className="font-semibold text-[#745E96] text-xs leading-tight">
                    {t(`categories.${idx}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid 2×3 de etapas — solo desktop */}
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {categoryIcons.map((Icon, idx) => (
                <div key={idx} className={`${categoryColors[idx]} border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                    <Icon className="w-8 h-8 mx-auto mb-3 text-brand-600" />
                    <h3 className="font-semibold text-[#745E96] mt-3">{t(`categories.${idx}`)}</h3>
                    <p className="text-sm text-[#9279BA] mt-1">{t(`categoryDesc.${idx}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats cards — auto-carousel en móvil, flex centrado en desktop */}
        <StatsCarousel
          stats={[
            { value: "250+", color: "text-teal-500", label: t("stats.0") },
            { value: "1,200+", color: "text-blue-500", label: t("stats.1") },
            { value: "92%", color: "text-teal-500", label: t("stats.2") },
          ]}
        />
      </div>
    </section>
  );
}

