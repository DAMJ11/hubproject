"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const footerByLanguage = {
  es: {
    brandText:
      "Plataforma B2B para conectar brands y manufacturers en procesos de diseño, desarrollo y producción de moda.",
    sections: {
      services: "Servicios",
      company: "Empresa",
      manufacturers: "Manufacturers",
      legal: "Legal",
    },
    links: {
      services: ["Streetwear", "Denim", "Activewear", "Outerwear", "Private Label", "Todas las categorías"],
      company: ["Sobre Nosotros", "Blog", "Programa para Manufacturers", "Contacto"],
      manufacturers: ["Crear perfil de fábrica", "Requisitos de verificación", "Centro de Ayuda"],
      legal: ["Términos y Condiciones", "Política de Privacidad", "Política de Cookies"],
    },
    copyright: "Todos los derechos reservados.",
  },
  en: {
    brandText:
      "B2B platform connecting brands and manufacturers across design, development and fashion production workflows.",
    sections: {
      services: "Capabilities",
      company: "Company",
      manufacturers: "Manufacturers",
      legal: "Legal",
    },
    links: {
      services: ["Streetwear", "Denim", "Activewear", "Outerwear", "Private Label", "All categories"],
      company: ["About Us", "Blog", "Manufacturer Program", "Contact"],
      manufacturers: ["Create factory profile", "Verification requirements", "Help Center"],
      legal: ["Terms and Conditions", "Privacy Policy", "Cookie Policy"],
    },
    copyright: "All rights reserved.",
  },
  fr: {
    brandText:
      "Plateforme B2B reliant marques et fabricants pour le design, le developpement et la production mode.",
    sections: {
      services: "Capacites",
      company: "Entreprise",
      manufacturers: "Fabricants",
      legal: "Legal",
    },
    links: {
      services: ["Streetwear", "Denim", "Activewear", "Outerwear", "Private Label", "Toutes les categories"],
      company: ["A propos", "Blog", "Programme Fabricants", "Contact"],
      manufacturers: ["Creer un profil usine", "Exigences de verification", "Centre d'aide"],
      legal: ["Conditions generales", "Politique de confidentialite", "Politique de cookies"],
    },
    copyright: "Tous droits reserves.",
  },
};

const serviceHrefs = ["/#servicios", "/#servicios", "/#servicios", "/#servicios", "/#servicios", "/#servicios"];
const companyHrefs = ["/sobre-nosotros", "/blog", "/para-fabricantes", "/contacto"];
const manufacturerHrefs = ["/register", "/#manufacturers", "/contacto"];
const legalHrefs = ["/terminos", "/privacidad", "/privacidad"];

export default function Footer() {
  const { language } = useLanguage();
  const t = footerByLanguage[language];

  return (
    <footer className="bg-[#1a365d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">FASHIONS DEN</span>
            </Link>
            <p className="text-sm text-gray-300 mt-3">{t.brandText}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.sections.services}</h4>
            <ul className="space-y-3">
              {t.links.services.map((name, idx) => (
                <li key={name}>
                  <Link href={serviceHrefs[idx]} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.sections.company}</h4>
            <ul className="space-y-3">
              {t.links.company.map((name, idx) => (
                <li key={name}>
                  <Link href={companyHrefs[idx]} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.sections.manufacturers}</h4>
            <ul className="space-y-3">
              {t.links.manufacturers.map((name, idx) => (
                <li key={name}>
                  <Link href={manufacturerHrefs[idx]} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.sections.legal}</h4>
            <ul className="space-y-3">
              {t.links.legal.map((name, idx) => (
                <li key={name}>
                  <Link href={legalHrefs[idx]} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} FASHIONS DEN. {t.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10">🌍 {language.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

