import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const articleImages = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop",
];

export default async function RecursosPage() {
  const t = await getTranslations("Resources");

  return (
    <main className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-landing-gradient to-white dark:from-slate-900 dark:to-slate-800 py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-900 dark:text-white">
            {t("title")}
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container-custom mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articleImages.map((image, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-[200px]">
                  <Image
                    src={image}
                    alt={t(`articles.${index}`)}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-brand-900 dark:text-white mb-4 line-clamp-3">
                    {t(`articles.${index}`)}
                  </h3>
                  <Link href="#">
                    <Button
                      variant="outline"
                      className="rounded-full px-6 border-2 border-brand-900 text-brand-900 hover:bg-brand-900 hover:text-white"
                    >
                      {t("readMore")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
