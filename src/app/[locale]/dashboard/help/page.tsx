"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { HelpCircle, Search, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, BookOpen, Shield, CreditCard, CalendarCheck } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  reservations: CalendarCheck,
  payments: CreditCard,
  security: Shield,
  account: BookOpen,
};

export default function HelpPage() {
  const { user } = useDashboardUser();
  const t = useTranslations("Help");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  if (!user) return null;

  const faqCategoryKeys = ["reservations", "reservations", "reservations", "payments", "payments", "security", "security", "account"];
  const faqs = faqCategoryKeys.map((key, i) => ({
    id: i + 1,
    categoryKey: key,
    question: t(`faq.${i}.question`),
    answer: t(`faq.${i}.answer`),
  }));

  const categoryKeys = Array.from(new Set(faqs.map((f) => f.categoryKey)));

  const filtered = faqs.filter((f) => {
    const matchSearch = `${f.question} ${f.answer}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "all" || f.categoryKey === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-[#2563eb]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-12 h-12 text-base" />
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCategory("all")}
            className={activeCategory === "all" ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : ""}>{t("allCategories")}</Button>
          {categoryKeys.map((key) => {
            const Icon = categoryIcons[key] || HelpCircle;
            return (
              <Button key={key} variant={activeCategory === key ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(key)}
                className={`gap-1 ${activeCategory === key ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : ""}`}>
                <Icon className="w-3.5 h-3.5" /> {t(`categories.${key}`)}
              </Button>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{t(`categories.${faq.categoryKey}`)}</span>
                  <span className="font-medium text-gray-900">{faq.question}</span>
                </div>
                {expandedId === faq.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedId === faq.id && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3 bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-6 max-w-3xl mx-auto">
          <h3 className="font-semibold text-lg mb-2">{t("contactTitle")}</h3>
          <p className="text-sm text-gray-500 mb-4">{t("contactSubtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-[#2563eb] hover:bg-[#2563eb]/5 transition-colors">
              <MessageSquare className="w-6 h-6 text-[#2563eb]" />
              <span className="text-sm font-medium">{t("chatLive")}</span>
              <span className="text-xs text-gray-500">{t("chatDescription")}</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-[#2563eb] hover:bg-[#2563eb]/5 transition-colors">
              <Mail className="w-6 h-6 text-[#2563eb]" />
              <span className="text-sm font-medium">{t("email")}</span>
              <span className="text-xs text-gray-500">{t("emailAddress")}</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-[#2563eb] hover:bg-[#2563eb]/5 transition-colors">
              <Phone className="w-6 h-6 text-[#2563eb]" />
              <span className="text-sm font-medium">{t("phone")}</span>
              <span className="text-xs text-gray-500">{t("phoneNumber")}</span>
            </button>
          </div>
        </Card>
    </div>
  );
}

