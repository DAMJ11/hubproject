import { getTranslations } from "next-intl/server";
import EarningsDashboardClient from "@/components/designer/EarningsDashboardClient";

export default async function EarningsPage() {
  const t = await getTranslations("DesignerEarnings");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <EarningsDashboardClient />
    </div>
  );
}
