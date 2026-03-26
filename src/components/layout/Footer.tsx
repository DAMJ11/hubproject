import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Sparkles } from "lucide-react";

const serviceHrefs = ["/#servicios", "/#servicios", "/#servicios", "/#servicios", "/#servicios", "/#servicios"];
const companyHrefs = ["/sobre-nosotros", "/blog", "/para-fabricantes", "/contacto"];
const manufacturerHrefs = ["/register", "/#manufacturers", "/contacto"];
const legalHrefs = ["/terminos", "/privacidad", "/privacidad"];

export default async function Footer() {
  const t = await getTranslations("Footer");
  const locale = await getLocale();

  return (
    <footer className="bg-brand-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">FASHIONS DEN</span>
            </Link>
            <p className="text-sm text-gray-300 mt-3">{t("brandText")}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t("services")}</h4>
            <ul className="space-y-3">
              {serviceHrefs.map((href, idx) => (
                <li key={idx}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-brand-600 transition-colors">
                    {t(`serviceLinks.${idx}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t("company")}</h4>
            <ul className="space-y-3">
              {companyHrefs.map((href, idx) => (
                <li key={idx}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-brand-600 transition-colors">
                    {t(`companyLinks.${idx}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t("manufacturers")}</h4>
            <ul className="space-y-3">
              {manufacturerHrefs.map((href, idx) => (
                <li key={idx}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-brand-600 transition-colors">
                    {t(`manufacturerLinks.${idx}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t("legal")}</h4>
            <ul className="space-y-3">
              {legalHrefs.map((href, idx) => (
                <li key={idx}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-brand-600 transition-colors">
                    {t(`legalLinks.${idx}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} FASHIONS DEN. {t("copyright")}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10">🌍 {locale.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

