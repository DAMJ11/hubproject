import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";
import DesignersDirectoryClient from "@/components/designer/DesignersDirectoryClient";

export default async function DesignersPage() {
  const t = await getTranslations("DesignersDirectory");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t("heroTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <section className="container-custom mx-auto px-4 py-8 pb-16">
        <DesignersDirectoryClient />
      </section>

      <Footer />
    </main>
  );
}
