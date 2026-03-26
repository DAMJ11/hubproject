import { CardSkeleton } from "@/components/shared/skeleton-loader";

export default function ProposalsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-7 w-48" />
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-4 w-72" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
