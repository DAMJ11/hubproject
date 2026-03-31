"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthTransition, StaggeredTransition } from "@/components/shared/page-transition";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-landing-light dark:bg-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthTransition className="w-full max-w-md">
          <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-6 shadow-sm">
            <StaggeredTransition delay={0.1}>
              <div className="flex items-center justify-center mb-6">
                <Link href="/">
                  <Image
                    src="/images/brand/logo-dark.svg"
                    alt="FashionsDen"
                    width={200}
                    height={44}
                    className="h-9 w-auto"
                    priority
                  />
                </Link>
              </div>
            </StaggeredTransition>

            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("sentTitle")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("sentDescription")}</p>
                <Link href="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                  {t("backToLogin")}
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("title")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t("description")}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("email")}</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@site.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-11 bg-brand-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? t("sending") : t("send")}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                      {t("backToLogin")}
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </AuthTransition>
      </main>
    </div>
  );
}
