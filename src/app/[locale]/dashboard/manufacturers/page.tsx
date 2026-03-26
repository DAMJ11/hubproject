import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import ManufacturersList from "./manufacturers-list";

interface Category {
  id: number;
  name: string;
}

export default async function ManufacturersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const categories = (await query<Category[]>(
    "SELECT id, name FROM service_categories WHERE is_active = TRUE ORDER BY sort_order, name"
  )) ?? [];

  return <ManufacturersList userRole={user.role} categories={categories} />;
}
