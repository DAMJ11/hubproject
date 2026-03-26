import { redirect } from "next/navigation";
import { getCertifications } from "@/lib/data/certifications";
import CertificationsManager from "./certifications-manager";

export default async function CertificationsPage() {
  const certs = await getCertifications();
  if (certs === null) redirect("/login");

  return <CertificationsManager initialCerts={certs} />;
}
