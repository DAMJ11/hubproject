import { redirect } from "next/navigation";
import { getReviewsList } from "@/lib/data/reviews";
import ReviewsList from "./reviews-list";

export default async function ReviewsPage() {
  const data = await getReviewsList();
  if (!data) redirect("/login");

  return <ReviewsList reviews={data.reviews} isAdmin={data.isAdmin} />;
}

