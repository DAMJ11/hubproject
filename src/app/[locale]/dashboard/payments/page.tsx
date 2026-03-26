import { redirect } from "next/navigation";
import { getPaymentsList } from "@/lib/data/payments";
import PaymentsList from "./payments-list";

export default async function PaymentsPage() {
  const data = await getPaymentsList();
  if (!data) redirect("/login");

  return <PaymentsList payments={data.payments} totals={data.totals} />;
}
