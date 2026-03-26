import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-gray-200 dark:text-slate-700 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Volver al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
