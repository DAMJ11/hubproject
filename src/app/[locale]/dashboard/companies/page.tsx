import { redirect } from "next/navigation";
import { getCompanies } from "@/lib/data/companies";
import CompaniesList from "./companies-list";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const companies = await getCompanies(type);
  if (!companies) redirect("/login");

  return <CompaniesList companies={companies} initialType={type ?? ""} />;
}

