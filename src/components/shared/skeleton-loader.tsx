function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 ${className}`} />;
}

/** Skeleton for a generic card (title + lines + footer) */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Pulse className="h-4 w-16" />
        <Pulse className="h-5 w-20 rounded-full" />
      </div>
      <Pulse className="h-5 w-3/4" />
      <Pulse className="h-4 w-1/2" />
      <div className="flex gap-4 pt-2">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-4 w-24" />
      </div>
    </div>
  );
}

/** Skeleton for a full list page (header + filter tabs + N cards) */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Pulse className="h-7 w-48" />
        <Pulse className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for a table with rows */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="border-b border-gray-200 dark:border-slate-700 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 flex gap-4 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Pulse key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a stats row (icon + number + label) */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-2">
          <Pulse className="h-10 w-10 rounded-xl" />
          <Pulse className="h-6 w-16" />
          <Pulse className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
