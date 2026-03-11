"use client";

import { BadgeCheck, ShieldCheck, MessageSquareText, Timer, Layers, LineChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  es: {
    title: "Por que elegir nuestra red de producción?",
    subtitle: "Diseñada para marcas de moda que necesitan agilidad comercial sin perder estándar de calidad.",
    items: [
      ["Manufacturers verificados", "Perfiles evaluados por capacidad productiva, historial de cumplimiento y tipo de prenda."],
      ["Ordenes con control", "Hitos y acuerdos visibles para ambas partes, con evidencia de cambios y aprobaciones."],
      ["Comunicación centralizada", "Mensajería por orden para evitar pérdida de contexto entre diseño, muestra y producción."],
      ["Tiempos trazables", "Seguimiento desde sample hasta despacho para anticipar retrasos y actuar a tiempo."],
      ["Escala por colecciones", "Gestiona múltiples drops, cápsulas o temporadas con estructura y visibilidad operativa."],
      ["Decisiones con datos", "Mide desempeño de fábricas, costos y cumplimiento para mejorar cada ciclo de producción."],
    ],
  },
  en: {
    title: "Why choose our production network?",
    subtitle: "Built for fashion brands that need commercial speed without compromising quality standards.",
    items: [
      ["Verified manufacturers", "Profiles vetted by production capacity, track record and product category."],
      ["Order control", "Milestones and agreements visible to both sides, with clear approval history."],
      ["Centralized communication", "Order-based messaging to avoid losing context between design, sample and production."],
      ["Traceable timelines", "Track from sample to dispatch to anticipate delays and act early."],
      ["Collection scale", "Manage multiple drops, capsules or seasons with structure and visibility."],
      ["Data-driven decisions", "Measure factory performance, costs and delivery to improve every cycle."],
    ],
  },
  fr: {
    title: "Pourquoi choisir notre reseau de production ?",
    subtitle: "Concu pour les marques de mode qui veulent de l'agilite sans perdre les standards qualite.",
    items: [
      ["Fabricants verifies", "Profils evalues selon capacite de production, historique de performance et categorie produit."],
      ["Commandes sous controle", "Jalons et accords visibles pour les deux parties avec historique des validations."],
      ["Communication centralisee", "Messagerie par commande pour garder le contexte entre design, sample et production."],
      ["Delais tracables", "Suivi du sample a l'expedition pour anticiper les retards et agir rapidement."],
      ["Echelle par collections", "Gerez plusieurs drops, capsules ou saisons avec structure et visibilite."],
      ["Decisions data-driven", "Mesurez performance usine, couts et respect des delais pour optimiser chaque cycle."],
    ],
  },
};

const icons = [BadgeCheck, ShieldCheck, MessageSquareText, Timer, Layers, LineChart];

export default function WhyManufySection() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1f2937]">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.items.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <div key={title} className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-[#2563eb]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1f2937] mb-3">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

