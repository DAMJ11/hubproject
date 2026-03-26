import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getContractDetail } from "@/lib/data/contracts";
import ContractDetailClient from "./contract-detail";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;
  const contractId = Number(id);

  if (isNaN(contractId)) redirect("/dashboard/contracts");

  const result = await getContractDetail(contractId);

  if (!result) {
    const t = await getTranslations("ContractDetail");
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t("notFound")}</p>
        <Link href="/dashboard/contracts">
          <Button variant="outline" className="mt-4">{t("back")}</Button>
        </Link>
      </div>
    );
  }

  return <ContractDetailClient contract={result.contract} userRole={result.userRole} />;
}
