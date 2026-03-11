"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const plansByLang = {
  es: {
    title: "Planes para brands y manufacturers",
    subtitle: "Escala tu operación con herramientas diseñadas para producción de moda en entornos colaborativos.",
    featured: "Mas elegido",
    plans: [
      {
        name: "Brand Starter",
        price: "Gratis",
        period: "",
        description: "Para marcas emergentes validando su primera cadena de producción",
        features: ["Hasta 2 pedidos activos", "Matching básico con manufacturers", "Mensajería por orden", "Soporte por email"],
        cta: "Empezar gratis",
      },
      {
        name: "Brand Scale",
        price: "$49",
        period: "/mes",
        description: "Para marcas en crecimiento con drops frecuentes",
        features: ["Pedidos ilimitados", "Comparador avanzado de fabricantes", "Hitos y alertas de producción", "Panel de desempeño por partner", "Soporte prioritario", "Colaboradores ilimitados"],
        cta: "Elegir Brand Scale",
      },
      {
        name: "Manufacturer Pro",
        price: "$79",
        period: "/mes",
        description: "Para fábricas que buscan volumen sostenido con marcas globales",
        features: ["Perfil verificado destacado", "Recepción de briefs calificados", "Métricas de cierre y cumplimiento", "Gestión multi-planta", "Integraciones vía API", "Acompañamiento comercial"],
        cta: "Hablar con ventas",
      },
    ],
  },
  en: {
    title: "Plans for brands and manufacturers",
    subtitle: "Scale your operation with tools designed for collaborative fashion production.",
    featured: "Most popular",
    plans: [
      {
        name: "Brand Starter",
        price: "Free",
        period: "",
        description: "For emerging brands validating their first production chain",
        features: ["Up to 2 active orders", "Basic manufacturer matching", "Order messaging", "Email support"],
        cta: "Start free",
      },
      {
        name: "Brand Scale",
        price: "$49",
        period: "/month",
        description: "For growing brands running frequent drops",
        features: ["Unlimited orders", "Advanced manufacturer comparison", "Production milestones and alerts", "Partner performance panel", "Priority support", "Unlimited collaborators"],
        cta: "Choose Brand Scale",
      },
      {
        name: "Manufacturer Pro",
        price: "$79",
        period: "/month",
        description: "For factories seeking steady volume from global brands",
        features: ["Featured verified profile", "Qualified brief intake", "Close-rate and delivery metrics", "Multi-plant management", "API integrations", "Commercial enablement"],
        cta: "Talk to sales",
      },
    ],
  },
  fr: {
    title: "Plans pour marques et fabricants",
    subtitle: "Faites evoluer vos operations avec des outils pensés pour la production mode collaborative.",
    featured: "Le plus choisi",
    plans: [
      {
        name: "Brand Starter",
        price: "Gratuit",
        period: "",
        description: "Pour les marques emergentes validant leur premiere chaine de production",
        features: ["Jusqu'a 2 commandes actives", "Matching fabricant de base", "Messagerie par commande", "Support email"],
        cta: "Commencer gratuitement",
      },
      {
        name: "Brand Scale",
        price: "$49",
        period: "/mois",
        description: "Pour les marques en croissance avec des drops frequents",
        features: ["Commandes illimitees", "Comparateur avance de fabricants", "Jalons et alertes de production", "Tableau de performance partenaire", "Support prioritaire", "Collaborateurs illimites"],
        cta: "Choisir Brand Scale",
      },
      {
        name: "Manufacturer Pro",
        price: "$79",
        period: "/mois",
        description: "Pour les usines cherchant un volume stable avec des marques globales",
        features: ["Profil verifie mis en avant", "Reception de briefs qualifies", "Metriques de closing et livraison", "Gestion multi-sites", "Integrations API", "Accompagnement commercial"],
        cta: "Parler aux ventes",
      },
    ],
  },
};

export default function PricingSection() {
  const { language } = useLanguage();
  const t = plansByLang[language];

  return (
    <section id="precios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1f2937]">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {t.plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                index === 1 ? "bg-[#111827] text-white ring-4 ring-[#111827]/20 scale-105" : "bg-gray-50 border border-gray-200"
              }`}
            >
              {index === 1 && (
                <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium mb-4">
                  {t.featured}
                </span>
              )}
              <h3 className={`text-xl font-bold ${index === 1 ? "text-white" : "text-[#1f2937]"}`}>{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${index === 1 ? "text-white" : "text-[#1f2937]"}`}>{plan.price}</span>
                {plan.period && <span className={index === 1 ? "text-white/70" : "text-gray-500"}>{plan.period}</span>}
              </div>
              <p className={`mt-3 text-sm ${index === 1 ? "text-white/80" : "text-gray-600"}`}>{plan.description}</p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${index === 1 ? "text-white" : "text-[#2563eb]"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/register">
                  <Button
                    className={`w-full h-12 rounded-lg font-medium ${
                      index === 1 ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]" : "bg-[#111827] text-white hover:bg-black"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

