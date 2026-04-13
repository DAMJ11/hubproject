import { getTranslations } from "next-intl/server";
import PayoutSettingsClient from "@/components/designer/PayoutSettingsClient";

export default async function PayoutSettingsPage() {
  const t = await getTranslations("DesignerEarnings");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("payoutSettings")}</h1>
      </div>
      <PayoutSettingsClient />
    </div>
  );
}
