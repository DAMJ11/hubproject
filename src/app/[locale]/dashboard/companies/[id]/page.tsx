import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CompanyDetail from "./company-detail";

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return <CompanyDetail companyId={id} />;
}
