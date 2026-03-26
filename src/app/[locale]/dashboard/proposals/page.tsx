import { redirect } from "next/navigation";
import { getProposalsData } from "@/lib/data/proposals";
import ProposalsList from "./proposals-list";

export default async function MyProposalsPage() {
  const data = await getProposalsData();
  if (!data) redirect("/login");

  return <ProposalsList proposals={data.proposals} offers={data.offers} />;
}

