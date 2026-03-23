"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

const BRAND_PLANS = [
  { key: "0", featured: false },
  { key: "1", featured: true },
  { key: "2", featured: false },
];
const SUPPLIER_PLANS = [
  { key: "0", featured: false },
  { key: "1", featured: true },
  { key: "2", featured: false },
];
const PLAN_FEATURES_COUNT = [3, 4, 4]; // features per brand plan
const SUPPLIER_FEATURES_COUNT = [3, 3, 3]; // features per supplier plan

export default function PricingSection() {
  const t = useTranslations("Pricing");
  const [activeTab, setActiveTab] = useState<"brands" | "suppliers">("brands");

  const plans = activeTab === "brands" ? BRAND_PLANS : SUPPLIER_PLANS;
  const prefix = activeTab === "brands" ? "brandPlans" : "supplierPlans";
  const featuresCount = activeTab === "brands" ? PLAN_FEATURES_COUNT : SUPPLIER_FEATURES_COUNT;

  return (
    <section id="precios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1f2937]">{t("title")}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "brands"
                  ? "bg-[#111827] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("tabBrands")}
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "suppliers"
                  ? "bg-[#111827] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("tabSuppliers")}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, planIdx) => (
            <div
              key={plan.key}
              className={`rounded-2xl p-8 ${
                plan.featured ? "bg-[#111827] text-white ring-4 ring-[#111827]/20 scale-105" : "bg-gray-50 border border-gray-200"
              }`}
            >
              {plan.featured && (
                <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium mb-4">
                  {t("featured")}
                </span>
              )}
              <h3 className={`text-xl font-bold ${plan.featured ? "text-white" : "text-[#1f2937]"}`}>{t(`${prefix}.${plan.key}.name`)}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.featured ? "text-white" : "text-[#1f2937]"}`}>{t(`${prefix}.${plan.key}.price`)}</span>
                <span className={plan.featured ? "text-white/70" : "text-gray-500"}>{t("perMonth")}</span>
              </div>
              <p className={`mt-3 text-sm ${plan.featured ? "text-white/80" : "text-gray-600"}`}>{t(`${prefix}.${plan.key}.desc`)}</p>

              <ul className="mt-8 space-y-3">
                {Array.from({ length: featuresCount[planIdx] }).map((_, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.featured ? "text-white" : "text-[#2563eb]"}`} />
                    <span>{t(`${prefix}.${plan.key}.features.${fi}`)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/register">
                  <Button
                    className={`w-full h-12 rounded-lg font-medium ${
                      plan.featured ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]" : "bg-[#111827] text-white hover:bg-black"
                    }`}
                  >
                    {t(`${prefix}.${plan.key}.cta`)}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-[#1f2937] mb-4">{t("trialTitle")}</h3>
            <ul className="space-y-2 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{t(`trialItems.${i}`)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>{t("trialNote")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

