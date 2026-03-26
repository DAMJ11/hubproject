import { redirect } from "next/navigation";
import { getSettingsUser } from "@/lib/data/settings";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const user = await getSettingsUser();
  if (!user) redirect("/login");

  return <SettingsForm user={user} />;
}


