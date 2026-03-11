"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  es: {
    title: "Capacidades de producción disponibles",
    subtitle: "Encuentra fabricantes especializados por categoría, volumen y nivel de complejidad técnica.",
    details: [
      "MOQ desde 120",
      "Lead time 4-6 sem",
      "Desarrollo tecnico",
      "Costuras performance",
      "Control por talla",
      "Series capsula",
      "Muestras en 10 dias",
      "Ready for retail",
      "Compliance infantil",
      "One-stop partner",
    ],
    featured: "Destacado",
  },
  en: {
    title: "Available production capabilities",
    subtitle: "Find specialized manufacturers by category, volume and technical complexity.",
    details: [
      "MOQ from 120",
      "Lead time 4-6 wks",
      "Technical development",
      "Performance seams",
      "Size control",
      "Capsule runs",
      "Samples in 10 days",
      "Ready for retail",
      "Kids compliance",
      "One-stop partner",
    ],
    featured: "Featured",
  },
  fr: {
    title: "Capacites de production disponibles",
    subtitle: "Trouvez des fabricants specialises par categorie, volume et complexite technique.",
    details: [
      "MOQ des 120",
      "Delai 4-6 sem",
      "Developpement technique",
      "Coutures performance",
      "Controle des tailles",
      "Series capsule",
      "Samples en 10 jours",
      "Pret retail",
      "Conformite kids",
      "One-stop partner",
    ],
    featured: "Mis en avant",
  },
};

const services = [
  { icon: "👕", name: "Camisetas y tops", nameEn: "Tees and tops", nameFr: "T-shirts et tops", desc: "Jersey, rib y blends premium", descEn: "Jersey, rib and premium blends", descFr: "Jersey, rib et melanges premium", popular: true },
  { icon: "👖", name: "Denim y bottoms", nameEn: "Denim and bottoms", nameFr: "Denim et bas", desc: "Jeans, cargos y pantalón sastre", descEn: "Jeans, cargos and tailored pants", descFr: "Jeans, cargos et pantalon tailleur", popular: true },
  { icon: "🧥", name: "Outerwear", nameEn: "Outerwear", nameFr: "Outerwear", desc: "Bomber, puffer y trench", descEn: "Bomber, puffer and trench", descFr: "Bomber, doudoune et trench", popular: false },
  { icon: "🏃", name: "Activewear", nameEn: "Activewear", nameFr: "Activewear", desc: "Leggings, tops y sets deportivos", descEn: "Leggings, tops and sport sets", descFr: "Leggings, tops et ensembles sport", popular: true },
  { icon: "👗", name: "Vestidos y sets", nameEn: "Dresses and sets", nameFr: "Robes et sets", desc: "Confección femenina y acabados finos", descEn: "Womenswear construction and fine finishes", descFr: "Confection feminine et finitions fines", popular: false },
  { icon: "🧢", name: "Accesorios", nameEn: "Accessories", nameFr: "Accessoires", desc: "Gorras, tote bags y trims", descEn: "Caps, tote bags and trims", descFr: "Casquettes, tote bags et trims", popular: false },
  { icon: "🧶", name: "Punto y knitwear", nameEn: "Knitwear", nameFr: "Maille", desc: "Galga fina y media", descEn: "Fine and mid gauge", descFr: "Jauge fine et moyenne", popular: true },
  { icon: "🧵", name: "Private label", nameEn: "Private label", nameFr: "Private label", desc: "Etiqueta, empaque y branding", descEn: "Labels, packaging and branding", descFr: "Etiquettes, packaging et branding", popular: true },
  { icon: "🧒", name: "Kidswear", nameEn: "Kidswear", nameFr: "Kidswear", desc: "Materiales suaves y seguros", descEn: "Soft and safe materials", descFr: "Materiaux souples et surs", popular: false },
  { icon: "🛍️", name: "Producción integral", nameEn: "Full production", nameFr: "Production complete", desc: "Del patronaje al packing final", descEn: "From pattern making to final packing", descFr: "Du patronage au packing final", popular: false },
];

export default function QualitySection() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1f2937]">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="relative bg-gray-50 border border-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
            >
              {service.popular && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t.featured}
                </span>
              )}
              <span className="text-4xl block mb-3">{service.icon}</span>
              <h3 className="font-semibold text-[#1f2937] text-sm group-hover:text-[#2563eb] transition-colors">
                {language === "en" ? service.nameEn : language === "fr" ? service.nameFr : service.name}
              </h3>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {language === "en" ? service.descEn : language === "fr" ? service.descFr : service.desc}
              </p>
              <p className="text-sm font-bold text-[#2563eb] mt-3">{t.details[index]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

