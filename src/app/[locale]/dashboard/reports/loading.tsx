import { CardSkeleton } from "@/components/shared/skeleton-loader";

export default function ReportsLoading() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
