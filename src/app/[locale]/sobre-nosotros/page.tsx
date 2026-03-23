import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function SobreNosotrosPage() {
  const t = await getTranslations("About");

  return (
    <main className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-16 md:py-24">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
                {t("title")}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("intro")}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("intro2")}
              </p>
              <Link href="https://app.projecthub.com/register">
                <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                  {t("joinUs")}
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt={t("title")}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-8">
            {t("missionTitle")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("missionText")}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#f8f8f8]">
        <div className="container-custom mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] text-center mb-12">
            {t("valuesTitle")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                  {t(`values.${index}.title`)}
                </h3>
                <p className="text-gray-600">{t(`values.${index}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-8">
            {t("ctaTitle")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://app.manufy.com/register">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                {t("ctaCreate")}
              </Button>
            </Link>
            <Link href="/contacto">
              <Button
                variant="outline"
                className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
              >
                {t("ctaContact")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
