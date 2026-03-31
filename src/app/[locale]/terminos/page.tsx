import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";

export default async function TerminosPage() {
  const t = await getTranslations("Legal");

  return (
    <main className="min-h-screen">
      <Header />
      <div className="bg-white dark:bg-slate-900 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-brand-900 dark:text-white mb-8">{t("termsTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t("lastUpdated")}: 31/03/2026</p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.acceptance.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.acceptance.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.services.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.services.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.accounts.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.accounts.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.payments.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.payments.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.ip.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.ip.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.liability.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.liability.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.termination.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.termination.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.changes.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.changes.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("terms.contact.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("terms.contact.text")}</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
