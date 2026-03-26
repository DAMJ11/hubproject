import { PageSkeleton } from "@/components/shared/skeleton-loader";

export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50 dark:bg-slate-900">
      <div className="w-full md:w-[420px] flex flex-col border-r border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-8 w-full" />
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="animate-pulse rounded-full bg-gray-200 dark:bg-slate-700 h-12 w-12 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-4 w-3/4" />
              <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-16 w-16 rounded-full" />
      </div>
    </div>
  );
}
