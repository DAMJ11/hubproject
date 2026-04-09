"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CreditCard, CheckCircle, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardUser } from "@/contexts/DashboardUserContext";

export default function SetupPaymentPage() {
  const t = useTranslations("SetupPayment");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useDashboardUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Prevent the success effect from re-running after it has already processed once,
  // which would cause an infinite loop (setUser updates user → user in deps re-triggers effect).
  const hasProcessedSuccess = useRef(false);

  const success = searchParams.get("success") === "true";

  // If payment was added successfully, update context and redirect
  useEffect(() => {
    if (!success || !user || hasProcessedSuccess.current) return;

    hasProcessedSuccess.current = true;
    if (!user.hasPaymentMethod) {
      setUser({ ...user, hasPaymentMethod: true });
    }
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, user, setUser, router]);

  // If user already has payment method, redirect away
  useEffect(() => {
    if (user?.hasPaymentMethod && !success) {
      router.push("/dashboard");
    }
  }, [user, success, router]);

  const handleSetupPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/setup", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();

      if (data.success && data.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        setError(data.message || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t("successTitle")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("successDescription")}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            {t("redirecting")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
          <CreditCard className="h-10 w-10 text-brand-600 dark:text-brand-300" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {t("description")}
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="text-left text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white">{t("secureTitle")}</p>
              <p className="mt-1">{t("secureDescription")}</p>
            </div>
          </div>
        </div>

        <ul className="mt-6 space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {t("benefit1")}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {t("benefit2")}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {t("benefit3")}
          </li>
        </ul>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <Button
          onClick={handleSetupPayment}
          disabled={loading}
          className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("loading")}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              {t("addCard")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
