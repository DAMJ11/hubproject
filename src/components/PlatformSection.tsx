"use client";

import { FileText, Factory, PackageCheck, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  es: {
    title: "Como funciona la plataforma?",
    subtitle:
      "Un flujo simple para pasar de idea a producción sin perder control de tiempos, calidad y comunicación.",
    steps: [
      ["Carga tu diseño", "Sube tech pack, materiales y referencias de estilo para que los manufacturers coticen con precisión."],
      ["Selecciona fabricante", "Compara capacidades, MOQ, tiempos y certificaciones para elegir el partner ideal de producción."],
      ["Aprueba muestra y orden", "Valida prototipos, negocia ajustes y confirma la orden con hitos claros de pago y entrega."],
      ["Monitorea la producción", "Sigue estado, incidencias y fechas de despacho en un tablero compartido entre brand y fábrica."],
    ],
  },
  en: {
    title: "How does the platform work?",
    subtitle: "A simple flow to move from idea to production with full control over timing, quality and communication.",
    steps: [
      ["Upload your design", "Upload tech pack, materials and style references so manufacturers can quote accurately."],
      ["Select manufacturer", "Compare capabilities, MOQ, lead times and certifications to choose the right production partner."],
      ["Approve sample and order", "Validate prototypes, negotiate adjustments and confirm the order with clear payment and delivery milestones."],
      ["Track production", "Follow status, incidents and shipping dates in a shared board for brand and factory."],
    ],
  },
  fr: {
    title: "Comment fonctionne la plateforme ?",
    subtitle: "Un flux simple pour passer de l'idee a la production, sans perdre le controle des delais, de la qualite et de la communication.",
    steps: [
      ["Chargez votre design", "Ajoutez tech pack, materiaux et references de style pour des devis precis des fabricants."],
      ["Selectionnez un fabricant", "Comparez capacites, MOQ, delais et certifications pour choisir le bon partenaire."],
      ["Validez echantillon et commande", "Validez les prototypes, negociez les ajustements et confirmez la commande avec des jalons clairs."],
      ["Suivez la production", "Suivez statut, incidents et dates d'expedition dans un tableau partage entre marque et usine."],
    ],
  },
};

const icons = [FileText, Factory, PackageCheck, Truck];

export default function PlatformSection() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1f2937]">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {t.steps.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <div key={title} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-[#2563eb]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#2563eb] transition-colors">
                    <Icon className="w-10 h-10 text-[#2563eb] group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {`0${index + 1}`}
                  </span>
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

