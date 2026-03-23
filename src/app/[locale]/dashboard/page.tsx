"use client";

import DashboardHome from "@/components/dashboard/DashboardHome";
import { useDashboardUser } from "@/contexts/DashboardUserContext";

export default function DashboardPage() {
  const { user } = useDashboardUser();

  if (!user) return null;

  return <DashboardHome user={user} />;
}
