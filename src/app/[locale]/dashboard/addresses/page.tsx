import { redirect } from "next/navigation";
import { getAddresses } from "@/lib/data/addresses";
import AddressesManager from "./addresses-manager";

export default async function AddressesPage() {
  const addresses = await getAddresses();
  if (addresses === null) redirect("/login");

  return <AddressesManager initialAddresses={addresses} />;
}
