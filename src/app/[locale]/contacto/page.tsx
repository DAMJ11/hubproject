import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "./ContactForm";
import { getTranslations } from "next-intl/server";

export default async function ContactoPage() {
  const t = await getTranslations("Contact");

  return (
    <main className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-landing-gradient dark:from-slate-900 to-white dark:to-slate-900 py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-900">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <ContactForm />

      <Footer />
    </main>
  );
}

