"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthTransition, StaggeredTransition, useButtonAnimation } from "@/components/ui/page-transition";

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  token?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const buttonAnimation = useButtonAnimation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    setServerError("");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          termsAccepted,
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        // Redirect to dashboard after successful registration
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(data.message);
      }
    } catch {
      setServerError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fbfb] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <AuthTransition className="w-full max-w-md">
          <div className="w-full bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {/* Logo */}
          <StaggeredTransition delay={0.1}>
            <div className="flex justify-center mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0d7a5f] rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
                <span className="font-bold text-2xl text-[#1a365d]">TidyHubb</span>
              </Link>
            </div>
          </StaggeredTransition>

          {/* Server Error Message */}
          {serverError && (
            <StaggeredTransition delay={0.2}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{serverError}</p>
              </motion.div>
            </StaggeredTransition>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@site.com"
                value={formData.email}
                onChange={handleChange}
                className={`h-11 rounded-lg border-gray-300 focus:border-[#0d7a5f] focus:ring-[#0d7a5f] ${
                  errors.email ? "border-red-400" : ""
                }`}
                required
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name<span className="text-red-400">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                className={`h-11 rounded-lg border-gray-300 focus:border-[#0d7a5f] focus:ring-[#0d7a5f] ${
                  errors.firstName ? "border-red-400" : ""
                }`}
                required
                disabled={isLoading}
              />
              {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name<span className="text-red-400">*</span>
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                className={`h-11 rounded-lg border-gray-300 focus:border-[#0d7a5f] focus:ring-[#0d7a5f] ${
                  errors.lastName ? "border-red-400" : ""
                }`}
                required
                disabled={isLoading}
              />
              {errors.lastName && <p className="text-xs text-red-400">{errors.lastName}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password<span className="text-red-400">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`h-11 rounded-lg border-gray-300 focus:border-[#0d7a5f] focus:ring-[#0d7a5f] ${
                  errors.password ? "border-red-400" : ""
                }`}
                required
                disabled={isLoading}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password<span className="text-red-400">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`h-11 rounded-lg border-gray-300 focus:border-[#0d7a5f] focus:ring-[#0d7a5f] ${
                  errors.confirmPassword ? "border-red-400" : ""
                }`}
                required
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked as boolean);
                  if (errors.terms) {
                    setErrors({ ...errors, terms: "" });
                  }
                }}
                className="mt-0.5 data-[state=checked]:bg-[#0d7a5f] data-[state=checked]:border-[#0d7a5f]"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-tight">
                I agree with the{" "}
                <Link href="/terminos" className="text-[#7c3aed] hover:text-[#6d28d9] transition-colors">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacidad" className="text-[#7c3aed] hover:text-[#6d28d9] transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

            {/* Submit Button */}
            <motion.div {...buttonAnimation}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#252d33] hover:bg-[#1a2127] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative bg-white px-4">
                <span className="text-xs text-gray-400 uppercase">o</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <motion.button
              type="button"
              className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
              {...buttonAnimation}
            >
              <Image
                src="https://ext.same-assets.com/1985226505/342828011.svg"
                alt="Google"
                width={28}
                height={28}
                className="w-7 h-7"
              />
              <span className="text-sm font-medium text-gray-700 underline">Registrarse con Google</span>
            </motion.button>

            {/* Login Link */}
            <StaggeredTransition delay={0.4}>
              <div className="text-center pt-2">
                <p className="text-sm text-gray-700 font-semibold">¿Ya tienes una cuenta?</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="text-sm font-bold text-[#7c3aed] hover:text-[#6d28d9] transition-colors inline-block"
                  >
                    Inicia sesión
                  </Link>
                </motion.div>
              </div>
            </StaggeredTransition>
          </form>
          </div>
        </AuthTransition>

        {/* Footer */}
        <StaggeredTransition delay={0.6}>
          <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
            <Image
              src="https://ext.same-assets.com/1985226505/1555541169.svg"
              alt="Language"
              width={28}
              height={14}
              className="w-7"
            />
            <span className="text-gray-700 font-medium">EN</span>
          </div>
          <span className="text-gray-400">·</span>
          <button className="flex items-center gap-1.5 text-[#7c3aed] hover:text-[#6d28d9] transition-colors font-medium">
            <Image
              src="https://ext.same-assets.com/1985226505/3949135229.svg"
              alt="Help"
              width={16}
              height={16}
            />
            <span>¿Necesitas ayuda?</span>
          </button>
          </div>
        </StaggeredTransition>
      </main>
    </div>
  );
}
