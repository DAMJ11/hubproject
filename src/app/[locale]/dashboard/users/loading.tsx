import { TableSkeleton } from "@/components/shared/skeleton-loader";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-7 w-48" />
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-4 w-72" />
      </div>
      <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-10 w-full max-w-sm" />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
