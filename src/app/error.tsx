"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("GlobalError");

  useEffect(() => {
    console.error(t("logPrefix"), error);
  }, [error, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t("description")}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
