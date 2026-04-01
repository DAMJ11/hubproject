"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { images } from "@/lib/images";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthTransition, StaggeredTransition } from "@/components/shared/page-transition";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordMin"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success(t("successToast"));
      } else {
        setError(data.message);
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-landing-light dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-6 shadow-sm text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("invalidToken")}</h2>
          <Link href="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-landing-light dark:bg-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthTransition className="w-full max-w-md">
          <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-6 shadow-sm">
            <StaggeredTransition delay={0.1}>
              <div className="flex items-center justify-center mb-6">
                <Link href="/">
                  <Image
                    src={images.logoDark}
                    alt="FashionsDen"
                    width={200}
                    height={44}
                    className="h-9 w-auto"
                    priority
                  />
                </Link>
              </div>
            </StaggeredTransition>

            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("successTitle")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("successDescription")}</p>
                <Link href="/login" className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                  {t("backToLogin")}
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("title")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t("description")}</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("newPassword")}</label>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("confirmPassword")}</label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="showPass"
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                    />
                    <label htmlFor="showPass" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{t("showPassword")}</label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !password || !confirmPassword}
                    className="w-full h-11 bg-brand-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? t("resetting") : t("reset")}
                  </Button>
                </form>
              </>
            )}
          </div>
        </AuthTransition>
      </main>
    </div>
  );
}
