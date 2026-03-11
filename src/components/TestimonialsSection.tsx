"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = {
  es: {
    title: "Resultados de brands y manufacturers",
    subtitle: "Equipos de moda que ya están produciendo con más velocidad, control y previsibilidad.",
    items: [
      ["Valeria Ruiz", "Founder, NOVA LABEL", "Pasamos de producir en tres chats separados a gestionar todo en un solo flujo. Hoy lanzamos colecciones con menos retrasos y mejor control de calidad.", "Brand de streetwear"],
      ["Andrés Peña", "Head of Production, AURA SPORT", "Conseguimos un manufacturer para activewear con experiencia real en telas técnicas. El proceso de muestras fue mucho más rápido.", "Marca activewear"],
      ["Paola Medina", "COO, LINO STUDIO", "El tracking por hitos nos ayudó a detectar cuellos de botella antes de que afectaran la fecha de entrega de temporada.", "Marca womenswear"],
      ["Textiles Rivera", "Manufacturer partner", "Ahora recibimos briefs mejor definidos y pedidos con más contexto técnico. Eso nos permitió mejorar tiempos de respuesta y tasa de cierre.", "Fábrica multi-categoría"],
      ["Confecciones Delta", "Manufacturer partner", "Nos conectamos con marcas que sí están listas para producir. Menos negociación improductiva, más órdenes concretas.", "Denim y outerwear"],
      ["Samuel Ortiz", "Supply Lead, MONOCHROME", "La mensajería por orden y el historial de cambios nos ahorran horas cada semana. El equipo opera con mejor claridad.", "Brand premium"],
    ],
  },
  en: {
    title: "Results from brands and manufacturers",
    subtitle: "Fashion teams producing with more speed, control and predictability.",
    items: [
      ["Valeria Ruiz", "Founder, NOVA LABEL", "We moved from three disconnected chats to one production flow. Now we launch collections with fewer delays and better quality control.", "Streetwear brand"],
      ["Andres Pena", "Head of Production, AURA SPORT", "We found an activewear manufacturer with real technical fabric expertise. The sampling process became much faster.", "Activewear brand"],
      ["Paola Medina", "COO, LINO STUDIO", "Milestone tracking helped us catch bottlenecks before they affected seasonal delivery dates.", "Womenswear brand"],
      ["Textiles Rivera", "Manufacturer partner", "We now receive better briefs and orders with stronger technical context. That improved our response times and close rate.", "Multi-category factory"],
      ["Confecciones Delta", "Manufacturer partner", "We connected with brands that are truly ready to produce. Less unproductive negotiation, more concrete orders.", "Denim and outerwear"],
      ["Samuel Ortiz", "Supply Lead, MONOCHROME", "Order-based messaging and change history save us hours every week. The team works with better clarity.", "Premium brand"],
    ],
  },
  fr: {
    title: "Resultats pour marques et fabricants",
    subtitle: "Des equipes mode qui produisent avec plus de vitesse, de controle et de previsibilite.",
    items: [
      ["Valeria Ruiz", "Founder, NOVA LABEL", "Nous sommes passes de trois chats separes a un flux unique. Nous sortons maintenant des collections avec moins de retards et un meilleur controle qualite.", "Marque streetwear"],
      ["Andres Pena", "Head of Production, AURA SPORT", "Nous avons trouve un fabricant activewear avec une vraie expertise des tissus techniques. Le process sample est bien plus rapide.", "Marque activewear"],
      ["Paola Medina", "COO, LINO STUDIO", "Le suivi par jalons nous a aide a detecter des goulets avant qu'ils n'impactent les dates de saison.", "Marque womenswear"],
      ["Textiles Rivera", "Manufacturer partner", "Nous recevons des briefs plus clairs et des commandes mieux cadrees. Cela a ameliore notre reactivite et notre taux de closing.", "Usine multi-categorie"],
      ["Confecciones Delta", "Manufacturer partner", "Nous sommes connectes a des marques vraiment pretes a produire. Moins de negociations improductives, plus de commandes concretes.", "Denim et outerwear"],
      ["Samuel Ortiz", "Supply Lead, MONOCHROME", "La messagerie par commande et l'historique des changements nous font gagner des heures chaque semaine.", "Marque premium"],
    ],
  },
};

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const t = testimonials[language];

  return (
    <section id="testimonios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1f2937]">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.items.map(([name, role, content, service]) => (
            <Card key={name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 5 ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                  ))}
                </div>

                <p className="text-gray-700 mb-4">&ldquo;{content}&rdquo;</p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500">
                      {role} • {service}
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

