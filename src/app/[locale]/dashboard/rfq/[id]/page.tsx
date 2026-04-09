import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RfqDetail from "./rfq-detail";

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  return <RfqDetail rfqId={id} userRole={user.role} />;
}
