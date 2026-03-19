"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error no manejado:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          Ocurrió un error inesperado. Por favor intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
