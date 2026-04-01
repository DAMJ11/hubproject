import { FileText, Search, ClipboardCheck, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [FileText, Search, ClipboardCheck, Truck];
const stepColors = [
  {
    badge: "bg-[#d8f4ee]",
    line: "bg-[#e9dfd8]",
    badgeText: "text-teal-700",
    iconBg: "bg-white/80",
    iconColor: "text-teal-600",
    cardBg: "bg-gradient-to-b from-[#eefaf7] via-[#f9fcfb] to-white",
  },
  {
    badge: "bg-[#ece3ff]",
    line: "bg-[#e9dfd8]",
    badgeText: "text-violet-700",
    iconBg: "bg-white/80",
    iconColor: "text-violet-600",
    cardBg: "bg-gradient-to-b from-[#f5f1ff] via-[#fbfaff] to-white",
  },
  {
    badge: "bg-[#ffdce9]",
    line: "bg-[#e9dfd8]",
    badgeText: "text-pink-700",
    iconBg: "bg-white/80",
    iconColor: "text-pink-600",
    cardBg: "bg-gradient-to-b from-[#fff2f7] via-[#fffafc] to-white",
  },
  {
    badge: "bg-[#d8f4ea]",
    line: "bg-[#e9dfd8]",
    badgeText: "text-emerald-700",
    iconBg: "bg-white/80",
    iconColor: "text-emerald-600",
    cardBg: "bg-gradient-to-b from-[#eefaf4] via-[#fbfdfc] to-white",
  },
];

export default async function PlatformSection() {
  const t = await getTranslations("Platform");

  return (
    <section id="como-funciona" className="py-20 bg-landing-neutral dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#745E96] dark:text-gray-100">{t("title")}</h2>
          <p className="mt-4 text-lg text-[#9279BA] dark:text-gray-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="relative">
          <div className="absolute left-[12.5%] right-[12.5%] top-4 hidden h-px bg-landing-beige dark:bg-slate-700 md:block" />

          <div className="grid gap-6 md:grid-cols-4 md:gap-5 lg:gap-7">
            {icons.map((Icon, index) => {
              const color = stepColors[index];
              return (
                <div key={index} className="relative flex h-full flex-col items-center">
                  <span
                    className={`relative z-10 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-white/90 px-3 text-xs font-semibold ${color.badge} ${color.badgeText} shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)]`}
                  >
                    {`0${index + 1}`}
                  </span>
                  <div className={`h-6 w-px ${color.line} opacity-90`} />
                  <div className="w-full flex-1">
                    <div className={`${color.cardBg} dark:!bg-slate-800 flex h-full flex-col rounded-[22px] border border-landing-beige-border dark:border-slate-700 px-5 py-6 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.45)] transition-shadow hover:shadow-[0_24px_50px_-36px_rgba(15,23,42,0.42)] md:px-6`}>
                      <div className={`mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl ${color.iconBg} shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)]`}>
                        <Icon className={`block h-6 w-6 ${color.iconColor}`} />
                      </div>
                      <h3 className="mb-3 text-[1.05rem] font-semibold leading-8 text-[#745E96] dark:text-gray-100">{t(`steps.${index}.title`)}</h3>
                      <p className="text-sm leading-7 text-[#9279BA] dark:text-gray-400">{t(`steps.${index}.desc`)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

