import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf, Recycle, Globe, Heart, Shield, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

const pillarIcons = [Leaf, Recycle, Globe, Heart, Shield, Users];

export default async function PoliticaSostenibilidadPage() {
  const t = await getTranslations("Sustainability");

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
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop"
                alt={t("title")}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] text-center mb-4">
            {t("pillarsTitle")}
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            {t("pillarsSubtitle")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillarIcons.map((Icon, index) => (
              <Card
                key={index}
                className="p-6 rounded-2xl hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-[#2563eb]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                    {t(`pillars.${index}.title`)}
                  </h3>
                  <p className="text-gray-600">{t(`pillars.${index}.desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#0d6c5d]">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            {t("commitmentTitle")}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            {t("commitmentText")}
          </p>
          <Link href="https://app.projecthub.com/register">
            <Button className="bg-white text-[#0d6c5d] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-medium">
              {t("commitmentButton")}
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-8">
            {t("ctaTitle")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacto">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                {t("ctaContact")}
              </Button>
            </Link>
            <Link href="https://app.projecthub.com/register">
              <Button
                variant="outline"
                className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
              >
                {t("ctaCreate")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

