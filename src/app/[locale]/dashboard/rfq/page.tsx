import { redirect } from "next/navigation";
import { getRfqList } from "@/lib/data/rfq";
import RfqList from "./rfq-list";

export default async function AdminRFQPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rfqs = await getRfqList(status);
  if (!rfqs) redirect("/login");

  return <RfqList rfqs={rfqs} initialStatus={status ?? ""} />;
}

