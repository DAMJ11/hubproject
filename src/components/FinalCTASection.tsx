import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function FinalCTASection() {
  const t = await getTranslations("FinalCTA");

  return (
    <section className="py-20 bg-gradient-to-br from-brand-900 to-brand-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{t("title")}</h2>
        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link href="/register">
            <Button size="lg" className="bg-white text-brand-900 hover:bg-gray-100 rounded-lg px-8 h-12 text-base font-semibold">
              {t("ctaPrimary")}
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white text-brand-900 hover:bg-white/10 rounded-lg px-8 h-12 text-base">
              {t("ctaSecondary")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

