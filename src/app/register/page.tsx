"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthResponse {
  success: boolean;
  message: string;
}

const getFlagSrc = (countryCode: "es" | "gb" | "fr") => `https://flagcdn.com/w40/${countryCode}.png`;

const text = {
  es: {
    accountType: "Tipo de cuenta",
    brand: "Soy marca",
    manufacturer: "Soy fabricante",
    brandHint: "Busco fabricantes",
    manufacturerHint: "Ofrezco producción",
    companyBrand: "Nombre de tu marca",
    companyManufacturer: "Nombre de tu empresa",
    email: "Email",
    firstName: "Nombre",
    lastName: "Apellido",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    termsA: "Acepto",
    termsB: "Términos y condiciones",
    termsC: "y",
    termsD: "Política de privacidad",
    submit: "Crear cuenta",
    loading: "Creando cuenta...",
    already: "¿Ya tienes cuenta?",
    login: "Inicia sesión",
    genericError: "Ocurrió un error. Por favor intenta de nuevo.",
    requiredEmail: "El email es obligatorio",
    invalidEmail: "Formato de email inválido",
    requiredFirstName: "El nombre es obligatorio",
    requiredLastName: "El apellido es obligatorio",
    requiredCompany: "El nombre de empresa es obligatorio (mín 2 caracteres)",
    requiredPassword: "La contraseña es obligatoria",
    shortPassword: "La contraseña debe tener al menos 8 caracteres",
    notMatch: "Las contraseñas no coinciden",
    termsRequired: "Debes aceptar términos y condiciones",
  },
  en: {
    accountType: "Account type",
    brand: "I am a brand",
    manufacturer: "I am a manufacturer",
    brandHint: "Looking for factories",
    manufacturerHint: "Offering production",
    companyBrand: "Brand name",
    companyManufacturer: "Company name",
    email: "Email",
    firstName: "First name",
    lastName: "Last name",
    password: "Password",
    confirmPassword: "Confirm password",
    termsA: "I agree to",
    termsB: "Terms and Conditions",
    termsC: "and",
    termsD: "Privacy Policy",
    submit: "Create account",
    loading: "Creating account...",
    already: "Already have an account?",
    login: "Log in",
    genericError: "An error occurred. Please try again.",
    requiredEmail: "Email is required",
    invalidEmail: "Invalid email format",
    requiredFirstName: "First name is required",
    requiredLastName: "Last name is required",
    requiredCompany: "Company name is required (min 2 characters)",
    requiredPassword: "Password is required",
    shortPassword: "Password must be at least 8 characters",
    notMatch: "Passwords do not match",
    termsRequired: "You must accept terms and conditions",
  },
  fr: {
    accountType: "Type de compte",
    brand: "Je suis une marque",
    manufacturer: "Je suis un fabricant",
    brandHint: "Je cherche des fabricants",
    manufacturerHint: "J'offre la production",
    companyBrand: "Nom de votre marque",
    companyManufacturer: "Nom de votre entreprise",
    email: "Email",
    firstName: "Prenom",
    lastName: "Nom",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    termsA: "J'accepte",
    termsB: "Conditions generales",
    termsC: "et",
    termsD: "Politique de confidentialite",
    submit: "Creer un compte",
    loading: "Creation du compte...",
    already: "Vous avez deja un compte ?",
    login: "Se connecter",
    genericError: "Une erreur est survenue. Veuillez reessayer.",
    requiredEmail: "Email obligatoire",
    invalidEmail: "Format d'email invalide",
    requiredFirstName: "Prenom obligatoire",
    requiredLastName: "Nom obligatoire",
    requiredCompany: "Nom d'entreprise obligatoire (min 2 caracteres)",
    requiredPassword: "Mot de passe obligatoire",
    shortPassword: "Le mot de passe doit contenir au moins 8 caracteres",
    notMatch: "Les mots de passe ne correspondent pas",
    termsRequired: "Vous devez accepter les conditions",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { language, setLanguage, languages } = useLanguage();
  const t = text[language];

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
  const selectedLanguage = languages.find((lang) => lang.code === language) ?? languages[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t.requiredEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.invalidEmail;
    if (!formData.firstName) newErrors.firstName = t.requiredFirstName;
    if (!formData.lastName) newErrors.lastName = t.requiredLastName;
    if (!formData.companyName || formData.companyName.trim().length < 2) newErrors.companyName = t.requiredCompany;
    if (!formData.password) newErrors.password = t.requiredPassword;
    else if (formData.password.length < 8) newErrors.password = t.shortPassword;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.notMatch;
    if (!termsAccepted) newErrors.terms = t.termsRequired;
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
      setServerError(t.genericError);
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
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)} className="cursor-pointer gap-2">
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
                <label className="block text-sm font-medium text-gray-700">{t.accountType}<span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("brand")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${role === "brand" ? "border-[#2563eb] bg-[#f6fbfb] text-[#2563eb]" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                    <span className="block text-lg mb-1">🏷️</span>
                    <span className="text-sm font-semibold">{t.brand}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{t.brandHint}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("manufacturer")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${role === "manufacturer" ? "border-[#2563eb] bg-[#f6fbfb] text-[#2563eb]" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                    <span className="block text-lg mb-1">🏭</span>
                    <span className="text-sm font-semibold">{t.manufacturer}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{t.manufacturerHint}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  {role === "brand" ? t.companyBrand : t.companyManufacturer}<span className="text-red-400">*</span>
                </label>
                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className={`h-11 rounded-lg border-gray-300 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.companyName ? "border-red-400" : ""}`} />
                {errors.companyName && <p className="text-xs text-red-400">{errors.companyName}</p>}
              </div>

              {[
                ["email", t.email, "email"],
                ["firstName", t.firstName, "text"],
                ["lastName", t.lastName, "text"],
                ["password", t.password, "password"],
                ["confirmPassword", t.confirmPassword, "password"],
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
                  {t.termsA} <Link href="/terminos" className="text-[#2563eb] hover:text-[#1d4ed8]">{t.termsB}</Link> {t.termsC} <Link href="/privacidad" className="text-[#2563eb] hover:text-[#1d4ed8]">{t.termsD}</Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

              <motion.div {...buttonAnimation}>
                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#111827] hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isLoading ? t.loading : t.submit}
                </Button>
              </motion.div>

              <StaggeredTransition delay={0.4}>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-700 font-semibold">{t.already}</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login" className="text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors inline-block">
                      {t.login}
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

