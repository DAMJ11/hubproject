"use client";

import { useState } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { HelpCircle, Search, ChevronDown, ChevronUp, BookOpen, Shield, CreditCard, Rocket, Factory, ClipboardList, MessageSquare, Mail } from "lucide-react";
import LiveChatWidget from "@/components/LiveChatWidget";

const categoryIcons: Record<string, React.ElementType> = {
  getting_started: Rocket,
  manufacturers_production: Factory,
  orders_process: ClipboardList,
  payments: CreditCard,
  security: Shield,
  account: BookOpen,
};

const categories = [
  { key: "getting_started", label: "Getting Started" },
  { key: "manufacturers_production", label: "Manufacturers & Production" },
  { key: "orders_process", label: "Orders & Process" },
  { key: "payments", label: "Payments" },
  { key: "account", label: "Account" },
] as const;

const faqs = [
  {
    id: 1,
    categoryKey: "getting_started",
    question: "How does FashionsDen work?",
    answer:
      "FashionsDen connects brands with manufacturers ready to produce their products. You can explore manufacturers, filter by what you need (like low MOQ, product type or location), and contact them directly to start your project. From samples to full production, everything starts with a conversation.",
  },
  {
    id: 2,
    categoryKey: "getting_started",
    question: "How do I find the right manufacturer?",
    answer:
      "Use filters to match your needs: product type, minimum order quantity (MOQ), location or production stage. Each manufacturer profile shows what they specialise in, what they offer and their production capabilities, so you can quickly identify who fits your project best.",
  },
  {
    id: 3,
    categoryKey: "getting_started",
    question: "Do I need experience to use the platform?",
    answer:
      "No. FashionsDen is designed for both beginners and established brands. Whether you are starting your first product or scaling production, you can find manufacturers that match your level and needs.",
  },
  {
    id: 4,
    categoryKey: "getting_started",
    question: "Can I start with small quantities?",
    answer:
      "Yes. Many manufacturers on FashionsDen offer low minimum order quantities (MOQ), including sample-only production or small batch runs. You can filter specifically for low MOQ to find the right partners.",
  },
  {
    id: 5,
    categoryKey: "getting_started",
    question: "What information do I need before contacting a manufacturer?",
    answer:
      "You do not need everything figured out, but it helps to have basics: product type, rough quantity, references or ideas, and timeline if you have one. Manufacturers can also guide you through the process if you are still defining the project.",
  },
  {
    id: 6,
    categoryKey: "manufacturers_production",
    question: "What is MOQ and how does it work?",
    answer:
      "MOQ stands for Minimum Order Quantity: the smallest number of units a manufacturer will produce per order. Each manufacturer sets their own MOQ. Some offer low MOQ (as low as 1 to 50 units), while others focus on larger production runs. You can filter by MOQ to match your stage and budget.",
  },
  {
    id: 7,
    categoryKey: "manufacturers_production",
    question: "Can I produce only samples first?",
    answer:
      "Yes, and you should. Do not jump into production before approving samples. Sampling helps validate fit, quality and communication before committing to larger quantities.",
  },
  {
    id: 8,
    categoryKey: "manufacturers_production",
    question: "How do I know if a manufacturer is reliable?",
    answer:
      "Each profile shows key details about services, specialisation and capabilities. You can contact manufacturers directly, ask detailed questions and start with a sample order before scaling.",
  },
  {
    id: 9,
    categoryKey: "manufacturers_production",
    question: "Can manufacturers help with design and patterns?",
    answer:
      "Yes. Many manufacturers offer pattern making, sample development and design support. Even if your idea is early-stage, you can develop the product with the right partner.",
  },
  {
    id: 10,
    categoryKey: "manufacturers_production",
    question: "What types of products can I create?",
    answer:
      "Depending on the manufacturer, you can create clothing (streetwear, activewear, swimwear, denim), accessories, and private label collections.",
  },
  {
    id: 11,
    categoryKey: "manufacturers_production",
    question: "Can I work with manufacturers internationally?",
    answer:
      "Yes. You can work locally or internationally. Many manufacturers offer worldwide shipping and have experience working with brands from different countries.",
  },
  {
    id: 12,
    categoryKey: "orders_process",
    question: "What happens after I contact a manufacturer?",
    answer:
      "You discuss your project directly with the manufacturer: product scope, quantities, pricing and timeline. Most projects begin with samples before moving into production.",
  },
  {
    id: 13,
    categoryKey: "orders_process",
    question: "How long does sampling take?",
    answer:
      "Sampling usually takes 14 to 60 days depending on product complexity. Some manufacturers offer faster options; always confirm timeline before starting.",
  },
  {
    id: 14,
    categoryKey: "orders_process",
    question: "How long does production take?",
    answer:
      "Timelines vary by quantity and complexity. As a guide: small batches can take 2 to 20 weeks, while larger runs may take 1 to 6 months.",
  },
  {
    id: 15,
    categoryKey: "orders_process",
    question: "Can I request changes after sampling?",
    answer:
      "Yes. Sampling is specifically for refinement. You can request adjustments before approving full production.",
  },
  {
    id: 16,
    categoryKey: "orders_process",
    question: "What happens if something goes wrong with my order?",
    answer:
      "You stay in direct communication with the manufacturer to resolve issues quickly. Starting with samples and clear expectations helps reduce risk.",
  },
  {
    id: 17,
    categoryKey: "payments",
    question: "How do payments work on FashionsDen?",
    answer:
      "Payments are managed through FashionsDen to improve structure, clarity and protection for both brands and manufacturers.",
  },
  {
    id: 18,
    categoryKey: "payments",
    question: "Do I pay upfront or in stages?",
    answer:
      "It depends on project type. Samples are usually paid upfront. Production often follows 50/50 terms (deposit plus final payment). Small orders under USD 5,000 may require full upfront payment.",
  },
  {
    id: 19,
    categoryKey: "payments",
    question: "Are payments secure?",
    answer:
      "Yes. Payments are processed and tracked inside the platform, providing accountability and visibility throughout each project stage.",
  },
  {
    id: 20,
    categoryKey: "payments",
    question: "What currency can I pay in?",
    answer: "FashionsDen supports major currencies such as USD and EUR. Available options are shown before payment confirmation.",
  },
  {
    id: 21,
    categoryKey: "payments",
    question: "Can I get a refund?",
    answer:
      "Refund eligibility depends on project stage and agreed terms. Before work starts it may be possible; after sampling or production starts, terms apply.",
  },
  {
    id: 22,
    categoryKey: "payments",
    question: "Why must payments stay on the platform?",
    answer:
      "Keeping payments on-platform protects both sides. Taking payments outside the platform removes safeguards and may restrict account access.",
  },
  {
    id: 23,
    categoryKey: "account",
    question: "How do I create an account?",
    answer:
      "Sign up with your email, choose your role (brand or manufacturer), and complete your profile to start using the platform.",
  },
  {
    id: 24,
    categoryKey: "account",
    question: "Can I edit my profile?",
    answer:
      "Yes. You can update profile details, services, product types and preferences at any time. A complete profile improves matching quality.",
  },
  {
    id: 25,
    categoryKey: "account",
    question: "Can I switch between brand and manufacturer?",
    answer:
      "No. Accounts are role-based from registration. If you need both sides, create separate accounts.",
  },
  {
    id: 26,
    categoryKey: "account",
    question: "How do I delete my account?",
    answer:
      "You can request account deletion from settings. Once confirmed, your account and associated data are permanently removed.",
  },
];

export default function HelpPage() {
  const { user } = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  if (!user) return null;

  const filtered = faqs.filter((f) => {
    const matchSearch = `${f.question} ${f.answer}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(f.categoryKey);
    return matchSearch && matchCat;
  });

  return (
    <>
      <LiveChatWidget />
      <div className="space-y-6 rounded-2xl border border-indigo-200/30 bg-gradient-to-b from-slate-950 via-[#090b3a] to-slate-950 p-4 text-slate-100 shadow-2xl md:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-300 text-violet-900">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-100">How can we help you?</h1>
          <p className="mt-2 text-lg text-slate-300">Find answers about working with manufacturers, orders, payments and your account.</p>
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="h-12 border-slate-700 bg-slate-900/80 pl-12 text-base text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategories.length === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategories([])}
            className={selectedCategories.length === 0 ? "bg-violet-400 text-slate-900 hover:bg-violet-300" : "border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800"}
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = categoryIcons[category.key] || HelpCircle;
            const selected = selectedCategories.includes(category.key);
            return (
              <Button
                key={category.key}
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(category.key)
                      ? prev.filter((key) => key !== category.key)
                      : [...prev, category.key]
                  );
                }}
                className={`min-w-[10rem] gap-1 ${selected ? "bg-violet-400 text-slate-900 hover:bg-violet-300" : "border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800"}`}
              >
                <Icon className="h-3.5 w-3.5" /> {category.label}
              </Button>
            );
          })}
        </div>

        <div className="mx-auto max-w-4xl space-y-3">
          {filtered.map((faq) => (
            <Card key={faq.id} className="overflow-hidden border-slate-700 bg-slate-900/70 text-slate-100">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700">
                    {categories.find((c) => c.key === faq.categoryKey)?.label}
                  </span>
                  <span className="font-medium text-slate-100">{faq.question}</span>
                </div>
                {expandedId === faq.id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>
              {expandedId === faq.id && (
                <div className="border-t border-slate-700 bg-white px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mx-auto max-w-4xl rounded-xl border border-violet-500/30 bg-violet-950/30 p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Didn't find what you were looking for?</h2>
          <p className="text-slate-300 mb-6">Our team is available to help you</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:info@fashionsden.com"
              className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-100 px-6 py-3 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
            >
              <Mail size={18} />
              <span>Email Support</span>
            </a>
            <button
              onClick={() => {
                const widget = document.querySelector('[data-live-chat-trigger]') as HTMLElement;
                widget?.click();
              }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <MessageSquare size={18} />
              <span>Live Chat</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            <strong>Email:</strong> info@fashionsden.com
          </p>
        </div>
      </div>
    </>
  );
}

