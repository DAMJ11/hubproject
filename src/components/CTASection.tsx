import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Building2, ShieldCheck, Handshake, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Building2, ShieldCheck, Handshake];

export default async function CTASection() {
  const t = await getTranslations("CTA");

  return (
    <section id="manufacturers" className="py-20 bg-[#9279BA] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{t("title")}</h2>
            <p className="mt-6 text-lg text-white/80">{t("subtitle")}</p>
            <div className="mt-8 space-y-4">
              {icons.map((Icon, index) => (
                <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-white/90">{t(`bullets.${index}`)}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <div className="flex flex-wrap gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-[#9279BA] hover:bg-white/90 rounded-lg px-8 h-12 font-semibold">
                    {t("cta")}
                  </Button>
                </Link>
                <Link
                  href="/#strategy-call"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white bg-transparent px-8 font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <Phone className="w-4 h-4" />
                  {t("ctaOptionalCall")}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-3xl font-bold">{t(`stats.${index}.value`)}</p>
                <p className="text-sm text-white/70 mt-2">{t(`stats.${index}.label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

