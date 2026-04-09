import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import TranslationsAdminPage from "@/components/dashboard/TranslationsAdminPage";

export default async function DashboardTranslationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    redirect("/dashboard");
  }

  return <TranslationsAdminPage />;
}
