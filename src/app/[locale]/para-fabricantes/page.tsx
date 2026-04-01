import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Rocket, MessageSquare, Factory } from "lucide-react";

const stepIcons = [Rocket, MessageSquare, Factory];

const featureImages = [
  "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
];

const featureReverse = [false, true, false];

const planHighlighted = [false, true, false];

export default async function ParaFabricantesPage() {
  const t = await getTranslations("ForManufacturers");

  return (
    <main className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-[#E7DDFF] to-white dark:from-slate-900 dark:to-slate-800 py-16 md:py-24">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#745E96] dark:text-white mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-[#9279BA] dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/register">
              <Button className="bg-[#7e7cf3] hover:bg-[#6a68e0] text-white rounded-full px-8 py-6 text-lg font-medium">
                {t("joinNow")}
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-2 border-[#7e7cf3] text-[#7e7cf3] hover:bg-[#7e7cf3] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
            >
              {t("learnMore")}
            </Button>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Image
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=500&fit=crop"
              alt="Manufacturing workshop"
              width={800}
              height={500}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[#745E96] dark:text-white leading-tight">
                {t("platformTitle")}
              </h2>
              <p className="text-[#9279BA] dark:text-gray-400 leading-relaxed text-base">
                {t("platformText1")}
              </p>
              <p className="text-[#9279BA] dark:text-gray-400 leading-relaxed text-base">
                {t("platformText2")}
              </p>
              <div className="mt-8">
              <Link href="/register">
                <Button className="bg-[#7e7cf3] hover:bg-[#6a68e0] text-white rounded-full px-8 py-6 text-lg font-medium">
                  {t("joinNow")}
                </Button>
              </Link>
              </div>
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

      <section className="py-16 md:py-24 bg-[#7e7cf3]">
        <div className="container-custom mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-white/80 text-lg">
              {t("howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {stepIcons.map((StepIcon, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <StepIcon size={64} color="#7e7cf3" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-[#745E96] dark:text-white mb-4">
                    {t(`steps.${index}.title`)}
                  </h3>
                  <p className="text-[#9279BA] dark:text-gray-400 text-base">{t(`steps.${index}.desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
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
                <h3 className="text-2xl md:text-3xl font-bold text-[#745E96] dark:text-white">
                  {t(`features.${index}.title`)}
                </h3>
                <p className="text-[#9279BA] dark:text-gray-400 leading-relaxed text-base">
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

      <section className="py-16 md:py-24 bg-[#E7DDFF]/30 dark:bg-slate-900">
        <div className="container-custom mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#745E96] dark:text-white mb-4">
              {t("pricingTitle")}
            </h2>
            <p className="text-[#9279BA] dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t("pricingSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[0, 1, 2].map((index) => (
              <Card
                key={index}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  planHighlighted[index]
                    ? "border-2 border-[#7e7cf3] shadow-xl"
                    : "border border-[#D1C1F2] shadow-lg"
                }`}
              >
                <CardContent className="p-8 text-center">
                  <h3 className="text-sm font-bold tracking-wider text-[#9279BA] dark:text-gray-400 mb-4">
                    {t(`plans.${index}.name`)}
                  </h3>

                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-lg text-[#7e7cf3] mr-1">$</span>
                    <span className="text-4xl font-bold text-[#7e7cf3]">
                      {t(`plans.${index}.price`)}
                    </span>
                    <span className="text-[#9279BA] dark:text-gray-400 ml-1">{t("perMonth")}</span>
                  </div>

                  <p className="text-[#9279BA] dark:text-gray-400 mb-6 min-h-[48px] text-base">
                    {t(`plans.${index}.desc`)}
                  </p>

                  <Link href="/register">
                    <Button
                      className={`rounded-full px-8 py-6 w-full font-medium transition-all ${
                        planHighlighted[index]
                          ? "bg-[#7e7cf3] hover:bg-[#6a68e0] text-white"
                          : "bg-white border-2 border-[#7e7cf3] text-[#7e7cf3] hover:bg-[#7e7cf3] hover:text-white"
                      }`}
                    >
                      {t("learnMorePlan")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#E7DDFF]/20 dark:bg-slate-800">
        <div className="container-custom mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-[#745E96] dark:text-white">
                  {t("ctaTitle")}
                </h2>
                <p className="text-[#9279BA] dark:text-gray-400 text-base">
                  {t("ctaSubtitle")}
                </p>
              </div>
              <div className="mt-8">
              <Link href="/register">
                <Button className="bg-[#7e7cf3] hover:bg-[#6a68e0] text-white rounded-full px-8 py-6 text-lg font-medium whitespace-nowrap">
                  {t("ctaButton")}
                </Button>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
