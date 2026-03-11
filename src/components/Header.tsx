"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";

const STORAGE_KEY = "dashboard-language";
const getFlagSrc = (countryCode: "es" | "gb" | "fr") => `https://flagcdn.com/w40/${countryCode}.png`;

const navLabels = {
  es: {
    capabilities: "Capacidades",
    howItWorks: "Cómo funciona",
    manufacturers: "Manufacturers",
    plans: "Planes",
    cases: "Casos",
    login: "Iniciar sesión",
    register: "Crear cuenta",
  },
  en: {
    capabilities: "Capabilities",
    howItWorks: "How it works",
    manufacturers: "Manufacturers",
    plans: "Plans",
    cases: "Cases",
    login: "Log in",
    register: "Create account",
  },
  fr: {
    capabilities: "Capacites",
    howItWorks: "Comment ca marche",
    manufacturers: "Manufacturiers",
    plans: "Plans",
    cases: "Cas clients",
    login: "Se connecter",
    register: "Creer un compte",
  },
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>("es");

  useEffect(() => {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    if (storedLanguage === "es" || storedLanguage === "en" || storedLanguage === "fr") {
      setLanguage(storedLanguage);
      document.documentElement.lang = storedLanguage;
      return;
    }

    document.documentElement.lang = "es";
  }, []);

  const labels = navLabels[language];
  const selectedLanguage = LANGUAGE_OPTIONS.find((lang) => lang.code === language) ?? LANGUAGE_OPTIONS[0];

  const navLinks = useMemo(
    () => [
      { name: labels.capabilities, href: "/#servicios" },
      { name: labels.howItWorks, href: "/#como-funciona" },
      { name: labels.manufacturers, href: "/#manufacturers" },
      { name: labels.plans, href: "/#precios" },
      { name: labels.cases, href: "/#testimonios" },
    ],
    [labels],
  );

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#111827]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-[#111827]">FASHIONS DEN</span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-[#2563eb] text-gray-700"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <motion.div
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <img
                    src={getFlagSrc(selectedLanguage.countryCode)}
                    alt={selectedLanguage.name}
                    className="w-5 h-4 rounded-[2px] object-cover"
                    loading="lazy"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <img
                      src={getFlagSrc(lang.countryCode)}
                      alt={lang.name}
                      className="w-5 h-4 rounded-[2px] object-cover"
                      loading="lazy"
                    />
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-[#2563eb]">
                  {labels.login}
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register">
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg">
                  {labels.register}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileMenuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="flex flex-col gap-3">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="text-gray-600 hover:text-[#2563eb] px-3 py-2 rounded-lg hover:bg-gray-50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
                <motion.div
                  className="flex flex-col gap-2 pt-3 border-t border-gray-100"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <img
                          src={getFlagSrc(selectedLanguage.countryCode)}
                          alt={selectedLanguage.name}
                          className="w-5 h-4 rounded-[2px] object-cover"
                          loading="lazy"
                        />
                        <span>{selectedLanguage.name}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-44">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <img
                            src={getFlagSrc(lang.countryCode)}
                            alt={lang.name}
                            className="w-5 h-4 rounded-[2px] object-cover"
                            loading="lazy"
                          />
                          <span>{lang.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        {labels.login}
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/register">
                      <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                        {labels.register}
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

