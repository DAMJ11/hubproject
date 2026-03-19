"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  es: {
    title: "Listo para acelerar tu próxima colección?",
    subtitle: "Conecta diseño, sourcing y producción en un solo espacio colaborativo entre brands y manufacturers.",
    ctaPrimary: "Crear cuenta y publicar pedido",
    ctaSecondary: "Entrar al panel",
  },
  en: {
    title: "Ready to accelerate your next collection?",
    subtitle: "Connect design, sourcing and production in one collaborative workspace for brands and manufacturers.",
    ctaPrimary: "Create account and publish order",
    ctaSecondary: "Go to dashboard",
  },
  fr: {
    title: "Pret a accelerer votre prochaine collection ?",
    subtitle: "Connectez design, sourcing et production dans un espace collaboratif pour marques et fabricants.",
    ctaPrimary: "Creer un compte et publier une commande",
    ctaSecondary: "Entrer dans le dashboard",
  },
};

export default function FinalCTASection() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="py-20 bg-gradient-to-br from-[#111827] to-[#2563eb] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{t.title}</h2>
        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">{t.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link href="/register">
            <Button size="lg" className="bg-white text-[#111827] hover:bg-gray-100 rounded-lg px-8 h-12 text-base font-semibold">
              {t.ctaPrimary}
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white text-[#111827] hover:bg-white/10 rounded-lg px-8 h-12 text-base">
              {t.ctaSecondary}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

