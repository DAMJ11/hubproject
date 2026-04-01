import { Star, FileEdit, MessageCircle, Search, ClipboardCheck, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Star, FileEdit, MessageCircle, Search, ClipboardCheck, Layers];
const cardStyles = [
  { iconBg: "bg-rose-50 dark:bg-rose-950/40", iconColor: "text-rose-500" },
  { iconBg: "bg-emerald-50 dark:bg-emerald-950/40", iconColor: "text-emerald-500" },
  { iconBg: "bg-amber-50 dark:bg-amber-950/40", iconColor: "text-amber-500" },
  { iconBg: "bg-blue-50 dark:bg-blue-950/40", iconColor: "text-blue-500" },
  { iconBg: "bg-teal-50 dark:bg-teal-950/40", iconColor: "text-teal-500" },
  { iconBg: "bg-violet-50 dark:bg-violet-950/40", iconColor: "text-violet-500" },
];

export default async function WhyManufySection() {
  const t = await getTranslations("WhyManufy");

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">{t("title")}</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {icons.map((Icon, index) => {
            const style = cardStyles[index];
            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100 dark:border-slate-700">
                <div className={`w-14 h-14 ${style.iconBg} rounded-full flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${style.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">{t(`items.${index}.title`)}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t(`items.${index}.desc`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

