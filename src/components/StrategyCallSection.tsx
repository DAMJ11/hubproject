"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Phone, Clock, CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function StrategyCallSection() {
  const t = useTranslations("StrategyCallSection");

  return (
    <section id="strategy-call" className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Brand card */}
          <StrategyCard
            role="brand"
            badge={t("brand.badge")}
            title={t("brand.title")}
            subtitle={t("brand.subtitle")}
            description={t("brand.description")}
            features={[
              t("brand.features.0"),
              t("brand.features.1"),
              t("brand.features.2"),
              t("brand.features.3"),
            ]}
            price={t("price")}
            priceNote={t("priceNote")}
            cta={t("cta")}
            duration={t("duration")}
          />

          {/* Manufacturer card */}
          <StrategyCard
            role="manufacturer"
            badge={t("manufacturer.badge")}
            title={t("manufacturer.title")}
            subtitle={t("manufacturer.subtitle")}
            description={t("manufacturer.description")}
            features={[
              t("manufacturer.features.0"),
              t("manufacturer.features.1"),
              t("manufacturer.features.2"),
              t("manufacturer.features.3"),
              t("manufacturer.features.4"),
              t("manufacturer.features.5"),
            ]}
            price={t("price")}
            priceNote={t("priceNote")}
            cta={t("cta")}
            duration={t("duration")}
          />
        </div>
      </div>
    </section>
  );
}

interface StrategyCardProps {
  role: "brand" | "manufacturer";
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  price: string;
  priceNote: string;
  cta: string;
  duration: string;
}

function StrategyCard({
  badge,
  title,
  subtitle,
  description,
  features,
  price,
  priceNote,
  cta,
  duration,
}: StrategyCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/strategy-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      const authMessage = typeof data?.message === "string" ? data.message.toLowerCase() : "";
      const isAuthError = res.status === 401 || res.status === 403 || authMessage.includes("autoriz");

      if (isAuthError) {
        router.push("/login?redirect=strategy-call");
        return;
      }

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-white/20">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        {badge}
      </div>

      {/* Title & subtitle */}
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm mb-3 italic">{subtitle}</p>

      {/* Duration badge */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
        <Clock className="w-4 h-4 flex-shrink-0" />
        {duration}
      </div>

      {/* Description */}
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{description}</p>

      {/* Features */}
      <ul className="space-y-2 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {/* Price */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{price}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 line-through">$250 USD</span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">{priceNote}</p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs mb-3">{error}</p>
      )}

      {/* CTA */}
      <Button
        onClick={handleBook}
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Phone className="w-4 h-4" />
            {cta}
            <ArrowRight className="w-4 h-4 ml-auto" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
        One-time payment · No commitment required
      </p>
    </div>
  );
}
