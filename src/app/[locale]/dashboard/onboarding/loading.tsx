import { PageSkeleton } from "@/components/shared/skeleton-loader";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-2xl p-8 space-y-6">
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-2 w-full rounded-full" />
        <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-8 w-64 mx-auto" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
