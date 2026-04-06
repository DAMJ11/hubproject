import Link from "next/link";

export default function MessagesPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-10 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Mensajería deshabilitada</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          La comunicación interna por chat está desactivada en esta versión de la plataforma.
          Si necesitas soporte o ayuda, utiliza los canales oficiales dentro del panel.
        </p>
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}
