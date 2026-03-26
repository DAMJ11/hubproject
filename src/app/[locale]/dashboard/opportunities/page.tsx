import { redirect } from "next/navigation";
import { getOpportunities } from "@/lib/data/opportunities";
import OpportunitiesList from "./opportunities-list";

export default async function OpportunitiesPage() {
  const rfqs = await getOpportunities();
  if (!rfqs) redirect("/login");

  return <OpportunitiesList rfqs={rfqs} />;
}

