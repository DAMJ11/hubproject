import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";

export default async function PrivacidadPage() {
  const t = await getTranslations("Legal");

  return (
    <main className="min-h-screen">
      <Header />
      <div className="bg-white dark:bg-slate-900 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-brand-900 dark:text-white mb-8">{t("privacyTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t("lastUpdated")}: 31/03/2026</p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.collection.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.collection.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.usage.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.usage.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.sharing.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.sharing.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.cookies.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.cookies.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.retention.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.retention.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.rights.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.rights.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.security.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.security.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.changes.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.changes.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-900 dark:text-white">{t("privacy.contact.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t("privacy.contact.text")}</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
