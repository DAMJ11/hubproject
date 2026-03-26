import { CardSkeleton } from "@/components/shared/skeleton-loader";

export default function GreenScoreLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
