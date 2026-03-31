"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthTransition, StaggeredTransition, useButtonAnimation } from "@/components/shared/page-transition";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

interface AuthResponse {
  success: boolean;
  message: string;
}

const getFlagSrc = (countryCode: string) => `https://flagcdn.com/w40/${countryCode}.png`;

const LANGUAGES = [
  { code: "es" as const, countryCode: "es", name: "Español" },
  { code: "en" as const, countryCode: "gb", name: "English" },
  { code: "fr" as const, countryCode: "fr", name: "Français" },
];

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const selectedLanguage = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  const { register, handleSubmit: rhfSubmit, formState: { errors: fieldErrors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [lastEmail, setLastEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const buttonAnimation = useButtonAnimation();

  // Handle verify email query params
  useEffect(() => {
    const verify = searchParams.get("verify");
    if (verify === "success") toast.success(t("verifySuccess"));
    else if (verify === "already") toast.info(t("verifyAlready"));
    else if (verify === "expired") toast.error(t("verifyExpired"));
    else if (verify === "invalid") toast.error(t("verifyInvalid"));
    else if (verify === "error") toast.error(t("error"));
  }, [searchParams, t]);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "es" | "en" | "fr" });
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError("");
    setEmailNotVerified(false);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password, rememberMe }),
      });

      const result: AuthResponse = await response.json();

      if (result.success) {
        toast.success(t("loginSuccess"));
        router.push("/dashboard");
        router.refresh();
      } else if (result.message === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setLastEmail(data.email);
        setServerError(t("emailNotVerified"));
      } else {
        setServerError(result.message);
        toast.error(t("loginError"));
      }
    } catch {
      setServerError(t("error"));
      toast.error(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!lastEmail) return;
    setResendingVerification(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lastEmail, locale }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("verificationResent"));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-landing-light dark:bg-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthTransition className="w-full max-w-md">
          <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-6 shadow-sm">
            <StaggeredTransition delay={0.1}>
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/images/brand/logo-dark.png"
                    alt="FashionsDen"
                    width={200}
                    height={44}
                    className="h-9 w-auto"
                    priority
                  />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 px-2.5 border-blue-100">
                      <Image
                        src={getFlagSrc(selectedLanguage.countryCode)}
                        alt={selectedLanguage.name}
                        width={20}
                        height={16}
                        className="w-5 h-4 rounded-[2px] object-cover"
                      />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem key={lang.code} onClick={() => switchLocale(lang.code)} className="cursor-pointer gap-2">
                        <Image src={getFlagSrc(lang.countryCode)} alt={lang.name} width={20} height={16} className="w-5 h-4 rounded-[2px] object-cover" />
                        <span>{lang.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </StaggeredTransition>

            {serverError && (
              <StaggeredTransition delay={0.2}>
                <div className="animate-in fade-in zoom-in-95 duration-200 mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600">{serverError}</p>
                  {emailNotVerified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                    >
                      {resendingVerification ? t("resendingVerification") : t("resendVerification")}
                    </button>
                  )}
                </div>
              </StaggeredTransition>
            )}

            <form onSubmit={rhfSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("email")}</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@site.com"
                  {...register("email")}
                  className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.email ? "border-red-400" : ""}`}
                  disabled={isLoading}
                />
                {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email.message}</p>}
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("password")}</label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  {...register("password")}
                  className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 pr-10 ${fieldErrors.password ? "border-red-400" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-9 right-3 p-1 bg-transparent border-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c2.25-4.5 6.75-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6.75 7.5-9.75 7.5s-7.5-3-9.75-7.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                </button>
                {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password.message}</p>}
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">{t("forgotPassword")}</Link>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{t("rememberMe")}</label>
              </div>

              <div className={buttonAnimation.className}>
                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-brand-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isLoading ? t("signingIn") : t("signIn")}
                </Button>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700"></div></div>
                <div className="relative bg-white dark:bg-slate-800 px-4"><span className="text-xs text-gray-400 dark:text-gray-500 uppercase">o</span></div>
              </div>

              <button type="button" className={`w-full h-11 flex items-center justify-center gap-3 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${buttonAnimation.className}`} disabled={isLoading}>
                <Image src="https://ext.same-assets.com/1985226505/3863342314.svg" alt="Google" width={28} height={28} className="w-7 h-7" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 underline">{t("signInGoogle")}</span>
              </button>

              <StaggeredTransition delay={0.4}>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{t("noAccount")}</p>
                  <div className="transition-transform hover:scale-105 active:scale-95">
                    <Link href="/register" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors inline-block">
                      {t("createNow")}
                    </Link>
                  </div>
                  <button type="button" className="mt-3 text-sm text-gray-400 hover:text-brand-600 transition-colors">
                    {t("needHelp")}
                  </button>
                </div>
              </StaggeredTransition>
            </form>
          </div>
        </AuthTransition>


      </main>
    </div>
  );
}

