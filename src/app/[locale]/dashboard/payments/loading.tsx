import { StatsSkeleton, TableSkeleton } from "@/components/shared/skeleton-loader";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-7 w-48" />
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-4 w-72" />
      </div>
      <StatsSkeleton count={3} />
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}
