"use client";

/**
 * Client-side versions of each landing section.
 * Server Components are converted by replacing:
 *   - `getTranslations` → `useTranslations`
 *   - `getLocale` → `useLocale`
 *   - `async function` → plain function
 * Already-client components (Header, PricingSection, StrategyCallSection) are imported directly.
 *
 * These are ONLY used inside the admin preview iframe.
 */

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { images } from "@/lib/images";
import {
  CheckCircle2,
  PenLine,
  FileText,
  Search,
  Scissors,
  Cog,
  Sparkles,
  ClipboardCheck,
  Truck,
  Star as StarIcon,
  FileEdit,
  MessageCircle,
  Layers,
  Shirt,
  Move,
  Tag,
  User,
  ShoppingBag,
  Building2,
  ShieldCheck,
  Handshake,
  Phone,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react";

// Import the 3 already-client components
import Header from "@/components/layout/Header";
import PricingSection from "@/components/PricingSection";
import StrategyCallSection from "@/components/StrategyCallSection";

export const PreviewHeader = Header;
export const PreviewPricing = PricingSection;
export const PreviewStrategyCall = StrategyCallSection;

// ─── Hero ───────────────────────────────────────────────────────────────────

const heroCategoryIcons = [PenLine, FileText, Search, Scissors, Cog, Sparkles];
const heroCategoryColors = [
  "bg-amber-50 border-amber-100",
  "bg-sky-50 border-sky-100",
  "bg-emerald-50 border-emerald-100",
  "bg-stone-100 border-stone-200",
  "bg-rose-50 border-rose-100",
  "bg-[#E7DDFF] border-[#D1C1F2]",
];

export function PreviewHero() {
  const t = useTranslations("Hero");
  return (
    <section className="relative bg-gradient-to-br from-landing-light via-white to-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
              {t("pill")}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 leading-tight">
              {t("titleA")}<br />
              {t("titleC")}<br />
              <span className="text-[#9279BA]">{t("titleB")}</span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-gray-600">{t("subtitle")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-brand-600" />
                  <span>{t(`highlights.${i}`)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-10">
              <Button size="lg" className="bg-[#9279BA] hover:bg-[#745E96] text-white rounded-lg px-6 h-12 text-base">
                {t("ctaPrimary")}
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg px-6 h-12 text-base border-[#9279BA] text-[#9279BA] hover:bg-[#9279BA]/5">
                {t("ctaSecondary")}
              </Button>
            </div>
            <div className="lg:hidden mt-8 grid grid-cols-3 gap-2">
              {heroCategoryIcons.map((Icon, idx) => (
                <div key={idx} className={`${heroCategoryColors[idx]} border rounded-xl p-3 flex flex-col items-center text-center`}>
                  <Icon className="w-5 h-5 text-brand-600 mb-1.5" />
                  <span className="font-semibold text-gray-900 text-xs leading-tight">{t(`categories.${idx}`)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {heroCategoryIcons.map((Icon, idx) => (
                <div key={idx} className={`${heroCategoryColors[idx]} border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                  <Icon className="w-8 h-8 mx-auto mb-3 text-brand-600" />
                  <h3 className="font-semibold text-gray-900 mt-3">{t(`categories.${idx}`)}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t(`categoryDesc.${idx}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Platform (Cómo funciona) ───────────────────────────────────────────────

const platformIcons = [FileText, Search, ClipboardCheck, Truck];
const stepColors = [
  { badge: "bg-[#d8f4ee]", line: "bg-[#e9dfd8]", badgeText: "text-teal-700", iconBg: "bg-white/80", iconColor: "text-teal-600", cardBg: "bg-gradient-to-b from-[#eefaf7] via-[#f9fcfb] to-white" },
  { badge: "bg-[#ece3ff]", line: "bg-[#e9dfd8]", badgeText: "text-violet-700", iconBg: "bg-white/80", iconColor: "text-violet-600", cardBg: "bg-gradient-to-b from-[#f5f1ff] via-[#fbfaff] to-white" },
  { badge: "bg-[#ffdce9]", line: "bg-[#e9dfd8]", badgeText: "text-pink-700", iconBg: "bg-white/80", iconColor: "text-pink-600", cardBg: "bg-gradient-to-b from-[#fff2f7] via-[#fffafc] to-white" },
  { badge: "bg-[#d8f4ea]", line: "bg-[#e9dfd8]", badgeText: "text-emerald-700", iconBg: "bg-white/80", iconColor: "text-emerald-600", cardBg: "bg-gradient-to-b from-[#eefaf4] via-[#fbfdfc] to-white" },
];

export function PreviewPlatform() {
  const t = useTranslations("Platform");
  return (
    <section className="py-20 bg-landing-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">{t("title")}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="relative">
          <div className="absolute left-[12.5%] right-[12.5%] top-4 hidden h-px bg-landing-beige md:block" />
          <div className="grid gap-6 md:grid-cols-4 md:gap-5 lg:gap-7">
            {platformIcons.map((Icon, index) => {
              const c = stepColors[index];
              return (
                <div key={index} className="relative flex h-full flex-col items-center">
                  <span className={`relative z-10 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-white/90 px-3 text-xs font-semibold ${c.badge} ${c.badgeText}`}>
                    {`0${index + 1}`}
                  </span>
                  <div className={`h-6 w-px ${c.line} opacity-90`} />
                  <div className="w-full flex-1">
                    <div className={`${c.cardBg} flex h-full flex-col rounded-[22px] border border-landing-beige-border px-5 py-6 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.45)] transition-shadow hover:shadow-[0_24px_50px_-36px_rgba(15,23,42,0.42)] md:px-6`}>
                      <div className={`mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl ${c.iconBg}`}>
                        <Icon className={`block h-6 w-6 ${c.iconColor}`} />
                      </div>
                      <h3 className="mb-3 text-[1.05rem] font-semibold leading-8 text-gray-800">{t(`steps.${index}.title`)}</h3>
                      <p className="text-sm leading-7 text-gray-600">{t(`steps.${index}.desc`)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── WhyManufy ──────────────────────────────────────────────────────────────

const whyIcons = [StarIcon, FileEdit, MessageCircle, Search, ClipboardCheck, Layers];
const whyCardStyles = [
  { iconBg: "bg-rose-50", iconColor: "text-rose-500" },
  { iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
  { iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { iconBg: "bg-teal-50", iconColor: "text-teal-500" },
  { iconBg: "bg-violet-50", iconColor: "text-violet-500" },
];

export function PreviewWhyManufy() {
  const t = useTranslations("WhyManufy");
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">{t("title")}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyIcons.map((Icon, index) => {
            const s = whyCardStyles[index];
            return (
              <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                <div className={`w-14 h-14 ${s.iconBg} rounded-full flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${s.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{t(`items.${index}.title`)}</h3>
                <p className="text-gray-600">{t(`items.${index}.desc`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Quality ────────────────────────────────────────────────────────────────

const qualityServices = [
  { icon: Shirt, iconColor: "text-[#c8915b]", iconBg: "bg-[#fbefe5]", cardBg: "bg-gradient-to-b from-[#fff7f0] via-[#fffdfa] to-white", accent: "text-[#c8915b]" },
  { icon: Tag, iconColor: "text-[#5a8fe8]", iconBg: "bg-[#eaf1ff]", cardBg: "bg-gradient-to-b from-[#f5f8ff] via-[#fcfdff] to-white", accent: "text-[#5a8fe8]" },
  { icon: Layers, iconColor: "text-[#89879c]", iconBg: "bg-[#f0eff5]", cardBg: "bg-gradient-to-b from-[#f9f8fc] via-[#fcfcfe] to-white", accent: "text-[#7f7d91]" },
  { icon: Move, iconColor: "text-[#6aa58c]", iconBg: "bg-[#e9f6ef]", cardBg: "bg-gradient-to-b from-[#f3fbf6] via-[#fcfefd] to-white", accent: "text-[#6aa58c]" },
  { icon: Shirt, iconColor: "text-[#cc7c92]", iconBg: "bg-[#fdeef3]", cardBg: "bg-gradient-to-b from-[#fff5f8] via-[#fffdfd] to-white", accent: "text-[#cc7c92]" },
  { icon: Tag, iconColor: "text-[#9279BA]", iconBg: "bg-[#E7DDFF]", cardBg: "bg-gradient-to-b from-[#f5f3ff] via-[#fefeff] to-white", accent: "text-[#9279BA]" },
  { icon: Layers, iconColor: "text-[#c98d51]", iconBg: "bg-[#fcf1e7]", cardBg: "bg-gradient-to-b from-[#fff7f0] via-[#fffdfb] to-white", accent: "text-[#c98d51]" },
  { icon: Tag, iconColor: "text-[#dd8b5f]", iconBg: "bg-[#fff1e8]", cardBg: "bg-gradient-to-b from-[#fff8f3] via-[#fffdfb] to-white", accent: "text-[#dd8b5f]" },
  { icon: User, iconColor: "text-[#7ab292]", iconBg: "bg-[#eef8f1]", cardBg: "bg-gradient-to-b from-[#f4fbf6] via-[#fcfefd] to-white", accent: "text-[#7ab292]" },
  { icon: ShoppingBag, iconColor: "text-[#9b9ba3]", iconBg: "bg-[#f1f1f3]", cardBg: "bg-gradient-to-b from-[#fafafa] via-[#fefefe] to-white", accent: "text-[#8d8d96]" },
];

export function PreviewQuality() {
  const t = useTranslations("Quality");
  return (
    <section className="bg-landing-neutral py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 lg:text-4xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 lg:text-lg">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {qualityServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className={`${service.cardBg} group flex min-h-[170px] flex-col rounded-2xl border border-[#ebe6e1] px-4 py-5 text-center shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 md:min-h-[184px] md:px-5`}>
                <div className={`mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full ${service.iconBg}`}>
                  <Icon className={`h-5 w-5 ${service.iconColor}`} />
                </div>
                <h3 className="text-[1rem] font-semibold leading-6 text-gray-800 transition-colors duration-300 group-hover:text-brand-900">
                  {t(`services.${index}.name`)}
                </h3>
                <p className="mt-2 text-xs leading-5 text-gray-500 md:text-[13px]">{t(`services.${index}.shortDesc`)}</p>
                <p className={`mt-auto pt-4 text-sm font-semibold ${service.accent}`}>{t(`services.${index}.detail`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ────────────────────────────────────────────────────────────

const ctaIcons = [Building2, ShieldCheck, Handshake];

export function PreviewCTA() {
  const t = useTranslations("CTA");
  return (
    <section className="py-20 bg-[#9279BA] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{t("title")}</h2>
            <p className="mt-6 text-lg text-white/80">{t("subtitle")}</p>
            <div className="mt-8 space-y-4">
              {ctaIcons.map((Icon, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-white/90">{t(`bullets.${index}`)}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" className="bg-white text-[#9279BA] hover:bg-white/90 rounded-lg px-8 h-12 font-semibold">
                {t("cta")}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#9279BA] rounded-lg px-8 h-12 font-semibold inline-flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t("ctaOptionalCall")}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-3xl font-bold">{t(`stats.${index}.value`)}</p>
                <p className="text-sm text-white/70 mt-2">{t(`stats.${index}.label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ───────────────────────────────────────────────────────────

export function PreviewTestimonials() {
  const t = useTranslations("Testimonials");
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">{t("title")}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">&ldquo;{t(`items.${index}.quote`)}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {t(`items.${index}.name`).split(" ").map((n: string) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t(`items.${index}.name`)}</p>
                    <p className="text-xs text-gray-500">
                      {t(`items.${index}.role`)} • {t(`items.${index}.badge`)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FinalCTA ───────────────────────────────────────────────────────────────

export function PreviewFinalCTA() {
  const t = useTranslations("FinalCTA");
  return (
    <section className="py-20 bg-gradient-to-br from-brand-900 to-brand-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{t("title")}</h2>
        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Button size="lg" className="bg-white text-brand-900 hover:bg-gray-100 rounded-lg px-8 h-12 text-base font-semibold">
            {t("ctaPrimary")}
          </Button>
          <Button size="lg" variant="outline" className="border-white text-brand-900 hover:bg-white/10 rounded-lg px-8 h-12 text-base">
            {t("ctaSecondary")}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

const serviceHrefs = ["#", "#", "#", "#", "#", "#"];
const companyHrefs = ["#", "#", "#", "#"];
const manufacturerHrefs = ["#", "#", "#"];
const legalHrefs = ["#", "#", "#"];

export function PreviewFooter() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  return (
    <footer className="bg-[#745E96] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <span className="flex items-center gap-2 mb-4">
              <Image src={images.logoLight} alt={t("logoAlt")} width={180} height={40} className="h-8 w-auto" />
            </span>
            <p className="text-sm text-gray-300 mt-3">{t("brandText")}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("services")}</h4>
            <ul className="space-y-3">
              {serviceHrefs.map((_, idx) => (
                <li key={idx}><span className="text-sm text-gray-300 cursor-default">{t(`serviceLinks.${idx}`)}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("company")}</h4>
            <ul className="space-y-3">
              {companyHrefs.map((_, idx) => (
                <li key={idx}><span className="text-sm text-gray-300 cursor-default">{t(`companyLinks.${idx}`)}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("manufacturers")}</h4>
            <ul className="space-y-3">
              {manufacturerHrefs.map((_, idx) => (
                <li key={idx}><span className="text-sm text-gray-300 cursor-default">{t(`manufacturerLinks.${idx}`)}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("legal")}</h4>
            <ul className="space-y-3">
              {legalHrefs.map((_, idx) => (
                <li key={idx}><span className="text-sm text-gray-300 cursor-default">{t(`legalLinks.${idx}`)}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} FashionsDen. {t("copyright")}</p>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10">🌍 {locale.toUpperCase()}</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Section Map ────────────────────────────────────────────────────────────

export const SECTION_MAP: Record<string, React.ComponentType> = {
  Hero: PreviewHero,
  Header: PreviewHeader,
  Platform: PreviewPlatform,
  WhyManufy: PreviewWhyManufy,
  Quality: PreviewQuality,
  CTA: PreviewCTA,
  Testimonials: PreviewTestimonials,
  StrategyCallSection: PreviewStrategyCall,
  Pricing: PreviewPricing,
  FinalCTA: PreviewFinalCTA,
  Footer: PreviewFooter,
};

/** Ordered list matching the landing page layout */
export const SECTION_ORDER = [
  "Header",
  "Hero",
  "Platform",
  "WhyManufy",
  "Quality",
  "CTA",
  "Testimonials",
  "StrategyCallSection",
  "Pricing",
  "FinalCTA",
  "Footer",
];
