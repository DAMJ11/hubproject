import { MessagesPanel } from "@/components/dashboard";

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="mx-auto max-w-full rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 min-h-[calc(100vh-3rem)]">
        <MessagesPanel />
      </div>
    </main>
  );
}
