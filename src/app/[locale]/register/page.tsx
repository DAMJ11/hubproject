"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import Image from "next/image";
import { images } from "@/lib/images";
import { ChevronDown, MailCheck, Phone, Loader2 } from "lucide-react";
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
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

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

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "good", color: "bg-yellow-500" };
  return { score, label: "strong", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Register");
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const { register, handleSubmit: rhfSubmit, watch, setValue, formState: { errors: fieldErrors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "brand", termsAccepted: false as unknown as true, firstName: "", lastName: "", email: "", password: "", confirmPassword: "", companyName: "" },
    mode: "onTouched",
  });

  const watchedPassword = watch("password", "");
  const watchedRole = watch("role");
  const watchedTerms = watch("termsAccepted");
  const strength = getPasswordStrength(watchedPassword ?? "");

  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const buttonAnimation = useButtonAnimation();

  const handleBookCall = async () => {
    setCallLoading(true);
    setCallError(null);
    try {
      const res = await fetch("/api/stripe/strategy-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setCallError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setCallError("Network error. Please try again.");
    } finally {
      setCallLoading(false);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-locale": locale,
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          companyName: data.companyName.trim(),
          termsAccepted: data.termsAccepted,
        }),
      });

      const result: AuthResponse = await response.json();
      if (result.success) {
        setRegistrationSuccess(true);
      } else {
        setServerError(result.message);
      }
    } catch {
      setServerError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-landing-light dark:bg-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <AuthTransition className="w-full max-w-md">
          <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-6 shadow-sm">
            <StaggeredTransition delay={0.1}>
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src={images.logoDark}
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
                      <Image src={getFlagSrc(selectedLanguage.countryCode)} alt={selectedLanguage.name} width={20} height={16} className="w-5 h-4 rounded-[2px] object-cover" />
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
                </div>
              </StaggeredTransition>
            )}

            {registrationSuccess ? (
              <div className="text-center space-y-4 py-4">
                <MailCheck className="w-14 h-14 text-brand-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("checkEmailTitle")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("checkEmailDescription")}</p>
                <Link href="/login" className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                  {t("goToLogin")}
                </Link>

                {/* Strategy call upsell */}
                <div className="mt-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 text-left">
                  <p className="text-sm font-semibold text-brand-800 dark:text-brand-200 mb-1">{t("strategyCallTitle")}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t("strategyCallDesc")}</p>
                  {callError && <p className="text-xs text-red-500 mb-2">{callError}</p>}
                  <Button
                    onClick={handleBookCall}
                    disabled={callLoading}
                    className="w-full h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    {callLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        {t("strategyCallCta")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
            <form onSubmit={rhfSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("accountType")}<span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("role", "brand")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${watchedRole === "brand" ? "border-brand-600 bg-landing-light dark:bg-brand-950/30 text-brand-600" : "border-gray-200 dark:border-slate-600 hover:border-gray-300 text-gray-600 dark:text-gray-300"}`}
                  >
                    <span className="block text-lg mb-1">🏷️</span>
                    <span className="text-sm font-semibold">{t("iAmBrand")}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("lookingForFactories")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("role", "manufacturer")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${watchedRole === "manufacturer" ? "border-brand-600 bg-landing-light dark:bg-brand-950/30 text-brand-600" : "border-gray-200 dark:border-slate-600 hover:border-gray-300 text-gray-600 dark:text-gray-300"}`}
                  >
                    <span className="block text-lg mb-1">🏭</span>
                    <span className="text-sm font-semibold">{t("iAmManufacturer")}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("offeringProduction")}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {watchedRole === "brand" ? t("brandName") : t("companyName")}<span className="text-red-400">*</span>
                </label>
                <Input id="companyName" {...register("companyName")} className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.companyName ? "border-red-400" : ""}`} />
                {fieldErrors.companyName && <p className="text-xs text-red-400">{fieldErrors.companyName.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("email")}<span className="text-red-400">*</span></label>
                <Input id="email" type="email" {...register("email")} className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.email ? "border-red-400" : ""}`} />
                {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("firstName")}<span className="text-red-400">*</span></label>
                  <Input id="firstName" {...register("firstName")} className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.firstName ? "border-red-400" : ""}`} />
                  {fieldErrors.firstName && <p className="text-xs text-red-400">{fieldErrors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("lastName")}<span className="text-red-400">*</span></label>
                  <Input id="lastName" {...register("lastName")} className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.lastName ? "border-red-400" : ""}`} />
                  {fieldErrors.lastName && <p className="text-xs text-red-400">{fieldErrors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("password")}<span className="text-red-400">*</span></label>
                <Input id="password" type="password" {...register("password")} className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.password ? "border-red-400" : ""}`} />
                {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password.message}</p>}
                {watchedPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-gray-200 dark:bg-slate-600"}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${strength.score <= 1 ? "text-red-500" : strength.score <= 2 ? "text-orange-500" : strength.score <= 3 ? "text-yellow-600" : "text-emerald-600"}`}>
                      {t(`passwordStrength.${strength.label}`)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("confirmPassword")}<span className="text-red-400">*</span></label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} className={`h-11 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-600 focus:ring-brand-600 ${fieldErrors.confirmPassword ? "border-red-400" : ""}`} />
                {fieldErrors.confirmPassword && <p className="text-xs text-red-400">{fieldErrors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={watchedTerms === true}
                  onCheckedChange={(checked) => setValue("termsAccepted", checked as true, { shouldValidate: true })}
                  className="mt-0.5 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-tight">
                  {t("iAgree")} <Link href="/terminos" className="text-brand-600 hover:text-brand-700">{t("terms")}</Link> {t("and")} <Link href="/privacidad" className="text-brand-600 hover:text-brand-700">{t("privacy")}</Link>
                </label>
              </div>
              {fieldErrors.termsAccepted && <p className="text-xs text-red-400">{fieldErrors.termsAccepted.message}</p>}

              <div className={buttonAnimation.className}>
                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-brand-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isLoading ? t("creating") : t("create")}
                </Button>
              </div>

              <StaggeredTransition delay={0.4}>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{t("hasAccount")}</p>
                  <Link href="/login" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors inline-block mt-1">
                    {t("logIn")}
                  </Link>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700"></div></div>
                  <div className="relative bg-white dark:bg-slate-800 px-4"><span className="text-xs text-gray-400 dark:text-gray-500 uppercase">o</span></div>
                </div>

                <button
                  type="button"
                  onClick={() => { setGoogleLoading(true); window.location.href = `/api/auth/google?locale=${locale}&role=${watchedRole}`; }}
                  disabled={isLoading || googleLoading}
                  className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {googleLoading ? (
                    <svg className="w-5 h-5 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Image src="https://ext.same-assets.com/1985226505/3863342314.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("signInGoogle")}</span>
                </button>
              </StaggeredTransition>
            </form>
            )}
          </div>
        </AuthTransition>
      </main>
    </div>
  );
}

