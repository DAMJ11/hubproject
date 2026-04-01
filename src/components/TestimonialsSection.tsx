import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function TestimonialsSection() {
  const t = await getTranslations("Testimonials");

  return (
    <section id="testimonios" className="py-20 bg-[#E7DDFF]/20 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#745E96] dark:text-gray-100">{t("title")}</h2>
          <p className="mt-4 text-lg text-[#9279BA] dark:text-gray-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 5 ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                  ))}
                </div>

                <p className="text-[#745E96] dark:text-gray-300 mb-4">&ldquo;{t(`items.${index}.quote`)}&rdquo;</p>

                <div className="flex items-center gap-3 pt-4 border-t border-[#D1C1F2] dark:border-slate-700">
                  <div className="w-10 h-10 bg-[#7e7cf3] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {t(`items.${index}.name`)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#745E96] dark:text-white text-sm">{t(`items.${index}.name`)}</p>
                    <p className="text-xs text-[#9279BA] dark:text-gray-400">
                      {t(`items.${index}.role`)} • {t(`items.${index}.badge`)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

