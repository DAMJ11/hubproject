import { redirect } from "next/navigation";
import { Leaf, Award, MapPin, Recycle, Star, TrendingUp } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getGreenScoreData } from "@/lib/data/green-score-data";

export default async function GreenScorePage() {
  const data = await getGreenScoreData();
  if (!data) redirect("/login");

  const t = await getTranslations("GreenScore");
  const locale = await getLocale();

  const scoreColor = data.avgScore >= 70 ? "text-emerald-500" : data.avgScore >= 40 ? "text-yellow-500" : "text-red-400";
  const scoreBg = data.avgScore >= 70 ? "bg-emerald-500" : data.avgScore >= 40 ? "bg-yellow-500" : "bg-red-400";

  const tips = [
    { icon: <Award className="w-5 h-5" />, text: t("tips.certifications"), done: data.certifications.length > 0 },
    { icon: <Recycle className="w-5 h-5" />, text: t("tips.materials"), done: false },
    { icon: <MapPin className="w-5 h-5" />, text: t("tips.proximity"), done: true },
    { icon: <Star className="w-5 h-5" />, text: t("tips.ratings"), done: false },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      {/* Score card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
        <div className={`w-28 h-28 mx-auto rounded-full ${scoreBg} flex items-center justify-center mb-4`}>
          <span className="text-4xl font-bold text-white">{data.avgScore}</span>
        </div>
        <p className={`text-lg font-semibold ${scoreColor}`}>
          {data.avgScore >= 70 ? t("scoreLabel.excellent") : data.avgScore >= 40 ? t("scoreLabel.good") : data.avgScore > 0 ? t("scoreLabel.needsImprovement") : t("scoreLabel.noData")}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("averageOfProposals", { count: data.totalProposals })}
        </p>

        {/* Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <ScoreItem label={t("breakdown.proximity")} value={data.breakdown.proximity} max={30} icon={<MapPin className="w-4 h-4" />} />
          <ScoreItem label={t("breakdown.materials")} value={data.breakdown.materials} max={35} icon={<Recycle className="w-4 h-4" />} />
          <ScoreItem label={t("breakdown.certifications")} value={data.breakdown.certifications} max={25} icon={<Award className="w-4 h-4" />} />
          <ScoreItem label={t("breakdown.history")} value={data.breakdown.history} max={10} icon={<Star className="w-4 h-4" />} />
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-brand-600" /> {t("certificationsTitle", { count: data.certifications.length })}
        </h2>
        {data.certifications.length === 0 ? (
          <p className="text-sm text-gray-500">{t("noCertifications")}</p>
        ) : (
          <div className="space-y-2">
            {data.certifications.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{c.certification_name}</span>
                  <span className="text-gray-400 ml-2">— {c.issued_by}</span>
                </div>
                {c.expires_at && <span className="text-xs text-gray-400">{t("expires", { date: new Date(c.expires_at).toLocaleDateString(locale) })}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" /> {t("howToImprove")}
        </h2>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-0.5 ${tip.done ? "text-emerald-500" : "text-gray-400"}`}>{tip.icon}</div>
              <p className={`text-sm ${tip.done ? "text-gray-500 line-through" : "text-gray-700 dark:text-gray-300"}`}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, value, max, icon }: { label: string; value: number; max: number; icon: React.ReactNode }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-400";

  return (
    <div className="text-center">
      <div className="text-brand-600 flex justify-center mb-1">{icon}</div>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}<span className="text-xs font-normal text-gray-400">/{max}</span></p>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

