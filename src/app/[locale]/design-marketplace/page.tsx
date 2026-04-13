import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";
import DesignMarketplaceClient from "@/components/designer/DesignMarketplaceClient";

export default async function DesignMarketplacePage() {
  const t = await getTranslations("DesignMarketplace");

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

      <DesignMarketplaceClient />

      <Footer />
    </main>
  );
}
