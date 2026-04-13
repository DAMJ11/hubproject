import DesignProjectDetail from "@/components/designer/DesignProjectDetail";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DesignProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  return <DesignProjectDetail projectId={Number(id)} userRole={user.role} />;
}
