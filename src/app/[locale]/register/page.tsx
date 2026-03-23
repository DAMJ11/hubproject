"use client";

import { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Register");
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [role, setRole] = useState<"brand" | "manufacturer">("brand");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const buttonAnimation = useButtonAnimation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t("validation.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t("validation.emailInvalid");
    if (!formData.firstName) newErrors.firstName = t("validation.firstNameRequired");
    if (!formData.lastName) newErrors.lastName = t("validation.lastNameRequired");
    if (!formData.companyName || formData.companyName.trim().length < 2) newErrors.companyName = t("validation.companyRequired");
    if (!formData.password) newErrors.password = t("validation.passwordRequired");
    else if (formData.password.length < 8) newErrors.password = t("validation.passwordLength");
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("validation.passwordMismatch");
    if (!termsAccepted) newErrors.terms = t("validation.termsRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setServerError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role,
          companyName: formData.companyName.trim(),
          termsAccepted,
        }),
      });

      const data: AuthResponse = await response.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(data.message);
      }
    } catch {
      setServerError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fbfb] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 py-8">
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
                      <img src={getFlagSrc(selectedLanguage.countryCode)} alt={selectedLanguage.name} className="w-5 h-4 rounded-[2px] object-cover" />
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

            {serverError && (
              <StaggeredTransition delay={0.2}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{serverError}</p>
                </motion.div>
              </StaggeredTransition>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t("accountType")}<span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("brand")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${role === "brand" ? "border-[#2563eb] bg-[#f6fbfb] text-[#2563eb]" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                    <span className="block text-lg mb-1">🏷️</span>
                    <span className="text-sm font-semibold">{t("iAmBrand")}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{t("lookingForFactories")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("manufacturer")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${role === "manufacturer" ? "border-[#2563eb] bg-[#f6fbfb] text-[#2563eb]" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                    <span className="block text-lg mb-1">🏭</span>
                    <span className="text-sm font-semibold">{t("iAmManufacturer")}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{t("offeringProduction")}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  {role === "brand" ? t("brandName") : t("companyName")}<span className="text-red-400">*</span>
                </label>
                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className={`h-11 rounded-lg border-gray-300 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.companyName ? "border-red-400" : ""}`} />
                {errors.companyName && <p className="text-xs text-red-400">{errors.companyName}</p>}
              </div>

              {[
                ["email", t("email"), "email"],
                ["firstName", t("firstName"), "text"],
                ["lastName", t("lastName"), "text"],
                ["password", t("password"), "password"],
                ["confirmPassword", t("confirmPassword"), "password"],
              ].map(([name, label, type]) => (
                <div key={String(name)} className="space-y-2">
                  <label htmlFor={String(name)} className="block text-sm font-medium text-gray-700">{label}<span className="text-red-400">*</span></label>
                  <Input
                    id={String(name)}
                    name={String(name)}
                    type={String(type)}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    className={`h-11 rounded-lg border-gray-300 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors[String(name)] ? "border-red-400" : ""}`}
                  />
                  {errors[String(name)] && <p className="text-xs text-red-400">{errors[String(name)]}</p>}
                </div>
              ))}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked as boolean);
                    if (errors.terms) setErrors({ ...errors, terms: "" });
                  }}
                  className="mt-0.5 data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb]"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-tight">
                  {t("iAgree")} <Link href="/terminos" className="text-[#2563eb] hover:text-[#1d4ed8]">{t("terms")}</Link> {t("and")} <Link href="/privacidad" className="text-[#2563eb] hover:text-[#1d4ed8]">{t("privacy")}</Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

              <motion.div {...buttonAnimation}>
                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#111827] hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isLoading ? t("creating") : t("create")}
                </Button>
              </motion.div>

              <StaggeredTransition delay={0.4}>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-700 font-semibold">{t("hasAccount")}</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login" className="text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors inline-block">
                      {t("logIn")}
                    </Link>
                  </motion.div>
                </div>
              </StaggeredTransition>
            </form>
          </div>
        </AuthTransition>
      </main>
    </div>
  );
}

