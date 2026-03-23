import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const stepIcons = [
  "https://ext.same-assets.com/1292233952/2736336818.png",
  "https://ext.same-assets.com/1292233952/2052961348.png",
  "https://ext.same-assets.com/1292233952/3200581809.png",
];

const featureImages = [
  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
];

const featureReverse = [false, true, false];

export default async function ParaMarcasPage() {
  const t = await getTranslations("ForBrands");

  return (
    <main className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-16 md:py-24">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a365d] mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://app.projecthub.com/register">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                {t("joinNow")}
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
            >
              {t("learnMore")}
            </Button>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop"
              alt="Fashion design studio"
              width={800}
              height={500}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] leading-tight">
                {t("platformTitle")}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t("platformText1")}
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t("platformText2")}
              </p>
              <Link href="https://app.projecthub.com/register">
                <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                  {t("joinNow")}
                </Button>
              </Link>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
                alt="Platform preview"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#0d6c5d]">
        <div className="container-custom mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-white/80 text-lg">
              {t("howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {stepIcons.map((icon, index) => (
              <Card
                key={index}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <Image
                      src={icon}
                      alt={t(`steps.${index}.title`)}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                    {t(`steps.${index}.title`)}
                  </h3>
                  <p className="text-gray-600">{t(`steps.${index}.desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 space-y-20">
          {featureImages.map((image, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                featureReverse[index] ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div
                className={`space-y-4 ${featureReverse[index] ? "lg:order-2" : ""}`}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-[#1a365d]">
                  {t(`features.${index}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t(`features.${index}.desc`)}
                </p>
              </div>
              <div className={featureReverse[index] ? "lg:order-1" : ""}>
                <Image
                  src={image}
                  alt={t(`features.${index}.title`)}
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a365d] mb-8 max-w-4xl mx-auto leading-tight">
            {t("ctaTitle")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://app.projecthub.com/register">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                {t("ctaExplore")}
              </Button>
            </Link>
            <Button variant="link" className="text-[#1a365d] font-medium text-lg">
              {t("ctaCall")}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
