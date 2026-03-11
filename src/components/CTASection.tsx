"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck, Handshake } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  es: {
    title: "Eres manufacturer? Conecta con marcas que si compran",
    subtitle:
      "Recibe briefs claros, pedidos estructurados y conversaciones directas con brands de moda en crecimiento. Menos fricción comercial, más producción activa.",
    bullets: [
      "Visibilidad frente a marcas segmentadas por categoría",
      "Proceso de órdenes transparente con hitos definidos",
      "Relaciones de largo plazo con compras recurrentes",
    ],
    cta: "Postular mi fábrica",
    stats: [
      "+38% Crecimiento promedio por fábrica",
      "14 días Primer pedido promedio",
      "84% Órdenes repetidas",
      "24/7 Mensajería entre equipos",
    ],
  },
  en: {
    title: "Are you a manufacturer? Connect with brands that are ready to buy",
    subtitle:
      "Receive clear briefs, structured orders and direct conversations with growing fashion brands. Less commercial friction, more active production.",
    bullets: [
      "Visibility to category-matched brands",
      "Transparent order process with clear milestones",
      "Long-term relationships with recurring orders",
    ],
    cta: "Apply as factory",
    stats: [
      "+38% Avg growth per factory",
      "14 days Average first order",
      "84% Repeat orders",
      "24/7 Team messaging",
    ],
  },
  fr: {
    title: "Vous etes fabricant ? Connectez-vous avec des marques pretes a acheter",
    subtitle:
      "Recevez des briefs clairs, des commandes structurees et des echanges directs avec des marques mode en croissance. Moins de friction commerciale, plus de production active.",
    bullets: [
      "Visibilite aupres de marques ciblees par categorie",
      "Processus de commande transparent avec jalons clairs",
      "Relations long terme avec commandes recurrentes",
    ],
    cta: "Postuler comme usine",
    stats: [
      "+38% Croissance moyenne par usine",
      "14 jours Premiere commande moyenne",
      "84% Commandes recurrentes",
      "24/7 Messagerie d'equipe",
    ],
  },
};

const statValues = ["+38%", "14", "84%", "24/7"];

export default function CTASection() {
  const { language } = useLanguage();
  const t = copy[language];
  const icons = [Building2, ShieldCheck, Handshake];

  return (
    <section id="manufacturers" className="py-20 bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{t.title}</h2>
            <p className="mt-6 text-lg text-white/80">{t.subtitle}</p>
            <div className="mt-8 space-y-4">
              {t.bullets.map((text, index) => {
                const Icon = icons[index];
                return (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-white/90">{text}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg px-8 h-12">
                  {t.cta}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {t.stats.map((text, index) => (
              <div key={text} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-3xl font-bold">{statValues[index]}</p>
                <p className="text-sm text-white/70 mt-2">{text.replace(statValues[index], "").trim()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

