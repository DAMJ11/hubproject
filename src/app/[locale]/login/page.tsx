"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { AuthTransition, StaggeredTransition, useButtonAnimation } from "@/components/ui/page-transition";
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

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Login");
  const selectedLanguage = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const buttonAnimation = useButtonAnimation();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "es" | "en" | "fr" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message);
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fbfb] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthTransition className="w-full max-w-md">
          <div className="w-full bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
            <StaggeredTransition delay={0.1}>
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <span className="font-bold text-2xl text-[#111827]">FASHIONS DEN</span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 px-2.5 border-blue-100">
                      <img
                        src={getFlagSrc(selectedLanguage.countryCode)}
                        alt={selectedLanguage.name}
                        className="w-5 h-4 rounded-[2px] object-cover"
                      />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem key={lang.code} onClick={() => switchLocale(lang.code)} className="cursor-pointer gap-2">
                        <img src={getFlagSrc(lang.countryCode)} alt={lang.name} className="w-5 h-4 rounded-[2px] object-cover" />
                        <span>{lang.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </StaggeredTransition>

            {error && (
              <StaggeredTransition delay={0.2}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              </StaggeredTransition>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t("email")}</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@site.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-gray-300 focus:border-[#2563eb] focus:ring-[#2563eb]"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t("password")}</label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-gray-300 focus:border-[#2563eb] focus:ring-[#2563eb] pr-10"
                  required
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
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">{t("forgotPassword")}</button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb]"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">{t("rememberMe")}</label>
              </div>

              <motion.div {...buttonAnimation}>
                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#111827] hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isLoading ? t("signingIn") : t("signIn")}
                </Button>
              </motion.div>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative bg-white px-4"><span className="text-xs text-gray-400 uppercase">o</span></div>
              </div>

              <motion.button type="button" className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" disabled={isLoading} {...buttonAnimation}>
                <Image src="https://ext.same-assets.com/1985226505/3863342314.svg" alt="Google" width={28} height={28} className="w-7 h-7" />
                <span className="text-sm font-medium text-gray-700 underline">{t("signInGoogle")}</span>
              </motion.button>

              <StaggeredTransition delay={0.4}>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-700 font-semibold">{t("noAccount")}</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/register" className="text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors inline-block">
                      {t("createNow")}
                    </Link>
                  </motion.div>
                </div>
              </StaggeredTransition>
            </form>
          </div>
        </AuthTransition>

        <StaggeredTransition delay={0.6}>
          <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-blue-100">
              <img src={getFlagSrc(selectedLanguage.countryCode)} alt="Language" className="w-7 h-4 object-cover rounded-[2px]" />
              <span className="text-gray-700 font-medium">{selectedLanguage.name}</span>
            </div>
            <span className="text-gray-400">·</span>
            <button className="flex items-center gap-1.5 text-[#2563eb] hover:text-[#1d4ed8] transition-colors font-medium">
              <span>{t("needHelp")}</span>
            </button>
          </div>
        </StaggeredTransition>
      </main>
    </div>
  );
}

