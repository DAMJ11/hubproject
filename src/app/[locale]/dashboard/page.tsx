import { redirect } from "next/navigation";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { getDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/login");

  return (
    <DashboardHome
      user={{ firstName: data.user.firstName, lastName: data.user.lastName, role: data.user.role }}
      initialStats={data.stats}
      initialProjects={data.projects}
    />
  );
}
