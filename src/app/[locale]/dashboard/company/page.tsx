import { redirect } from "next/navigation";
import { Factory } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentCompany } from "@/lib/data/companies";
import CompanyForm from "./company-form";

export default async function CompanyPage() {
  const company = await getCurrentCompany();
  if (!company) {
    const t = await getTranslations("Company");
    return (
      <div className="text-center py-16">
        <Factory className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700 mb-1">{t("noCompany")}</h2>
        <p className="text-gray-500">{t("noCompanyDesc")}</p>
      </div>
    );
  }

  return <CompanyForm company={company} />;
}
