"use client";

import { Shirt, Layers, Move, Tag, User, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

const services = [
  {
    icon: Shirt,
    iconColor: "text-[#c8915b]",
    iconBg: "bg-[#fbefe5]",
    cardBg: "bg-gradient-to-b from-[#fff7f0] via-[#fffdfa] to-white",
    accent: "text-[#c8915b]",
  },
  {
    icon: Tag,
    iconColor: "text-[#5a8fe8]",
    iconBg: "bg-[#eaf1ff]",
    cardBg: "bg-gradient-to-b from-[#f5f8ff] via-[#fcfdff] to-white",
    accent: "text-[#5a8fe8]",
  },
  {
    icon: Layers,
    iconColor: "text-[#89879c]",
    iconBg: "bg-[#f0eff5]",
    cardBg: "bg-gradient-to-b from-[#f9f8fc] via-[#fcfcfe] to-white",
    accent: "text-[#7f7d91]",
  },
  {
    icon: Move,
    iconColor: "text-[#6aa58c]",
    iconBg: "bg-[#e9f6ef]",
    cardBg: "bg-gradient-to-b from-[#f3fbf6] via-[#fcfefd] to-white",
    accent: "text-[#6aa58c]",
  },
  {
    icon: Shirt,
    iconColor: "text-[#cc7c92]",
    iconBg: "bg-[#fdeef3]",
    cardBg: "bg-gradient-to-b from-[#fff5f8] via-[#fffdfd] to-white",
    accent: "text-[#cc7c92]",
  },
  {
    icon: Tag,
    iconColor: "text-[#7e7cf3]",
    iconBg: "bg-[#f0efff]",
    cardBg: "bg-gradient-to-b from-[#f7f6ff] via-[#fefeff] to-white",
    accent: "text-[#7e7cf3]",
  },
  {
    icon: Layers,
    iconColor: "text-[#c98d51]",
    iconBg: "bg-[#fcf1e7]",
    cardBg: "bg-gradient-to-b from-[#fff7f0] via-[#fffdfb] to-white",
    accent: "text-[#c98d51]",
  },
  {
    icon: Tag,
    iconColor: "text-[#dd8b5f]",
    iconBg: "bg-[#fff1e8]",
    cardBg: "bg-gradient-to-b from-[#fff8f3] via-[#fffdfb] to-white",
    accent: "text-[#dd8b5f]",
  },
  {
    icon: User,
    iconColor: "text-[#7ab292]",
    iconBg: "bg-[#eef8f1]",
    cardBg: "bg-gradient-to-b from-[#f4fbf6] via-[#fcfefd] to-white",
    accent: "text-[#7ab292]",
  },
  {
    icon: ShoppingBag,
    iconColor: "text-[#9b9ba3]",
    iconBg: "bg-[#f1f1f3]",
    cardBg: "bg-gradient-to-b from-[#fafafa] via-[#fefefe] to-white",
    accent: "text-[#8d8d96]",
  },
];

export default function QualitySection() {
  const t = useTranslations("Quality");

  return (
    <section id="servicios" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1f2937] lg:text-4xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 lg:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {services.map((service, index) => (
            <div
              key={index}
              className={`${service.cardBg} group flex min-h-[170px] flex-col rounded-2xl border border-[#ebe6e1] px-4 py-5 text-center shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-30px_rgba(15,23,42,0.28)] md:min-h-[184px] md:px-5`}
            >
              {(() => {
                const Icon = service.icon;
                return (
                  <div className={`mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full ${service.iconBg}`}>
                    <Icon className={`h-5 w-5 ${service.iconColor}`} />
                  </div>
                );
              })()}
              <h3 className="text-[1rem] font-semibold leading-6 text-[#1f2937] transition-colors duration-300 group-hover:text-[#111827]">
                {t(`services.${index}.name`)}
              </h3>
              <p className="mt-2 text-xs leading-5 text-gray-500 md:text-[13px]">
                {t(`services.${index}.shortDesc`)}
              </p>
              <p className={`mt-auto pt-4 text-sm font-semibold ${service.accent}`}>{t(`services.${index}.detail`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

