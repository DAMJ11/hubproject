import { redirect } from "next/navigation";
import { getCapabilitiesWithCategories } from "@/lib/data/capabilities";
import CapabilitiesManager from "./capabilities-manager";

export default async function CapabilitiesPage() {
  const data = await getCapabilitiesWithCategories();
  if (!data) redirect("/login");

  return (
    <CapabilitiesManager
      initialCapabilities={data.capabilities}
      categories={data.categories}
    />
  );
}
