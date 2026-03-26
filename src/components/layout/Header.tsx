"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { ChevronDown, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppLocale } from "@/i18n/routing";

const LANGUAGE_OPTIONS = [
  { code: "es" as const, name: "Español", countryCode: "es" as const },
  { code: "en" as const, name: "English", countryCode: "gb" as const },
  { code: "fr" as const, name: "Français", countryCode: "fr" as const },
];

const getFlagSrc = (countryCode: "es" | "gb" | "fr") => `https://flagcdn.com/w40/${countryCode}.png`;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const selectedLanguage = LANGUAGE_OPTIONS.find((lang) => lang.code === locale) ?? LANGUAGE_OPTIONS[0];

  const switchLocale = (newLocale: AppLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks = useMemo(
    () => [
      { name: t("capabilities"), href: "/#servicios" },
      { name: t("howItWorks"), href: "/#como-funciona" },
      { name: t("manufacturers"), href: "/#manufacturers" },
      { name: t("plans"), href: "/#precios" },
      { name: t("cases"), href: "/#testimonios" },
    ],
    [t],
  );

  return (
    <header
      className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-brand-900/10 dark:border-slate-700 animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="transition-transform hover:scale-105 active:scale-95">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-brand-900">FASHIONS DEN</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-brand-600 text-gray-700 dark:text-gray-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div
            className="hidden md:flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3" aria-label={t("selectLanguage")}>
                  <Image
                    src={getFlagSrc(selectedLanguage.countryCode)}
                    alt={selectedLanguage.name}
                    width={20}
                    height={16}
                    className="w-5 h-4 rounded-[2px] object-cover"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => switchLocale(lang.code)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Image
                      src={getFlagSrc(lang.countryCode)}
                      alt={lang.name}
                      width={20}
                      height={16}
                      className="w-5 h-4 rounded-[2px] object-cover"
                    />
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="transition-transform hover:scale-105 active:scale-95">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-brand-600">
                  {t("login")}
                </Button>
              </Link>
            </div>
            <div className="transition-transform hover:scale-105 active:scale-95">
              <Link href="/register">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg">
                  {t("register")}
                </Button>
              </Link>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-transform hover:scale-105 active:scale-95"
            aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileMenuOpen}
          >
            <div className="transition-transform duration-200">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-all hover:translate-x-1 animate-in fade-in slide-in-from-left-4 duration-200 fill-mode-both"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {link.name}
                </a>
              ))}
              <div
                className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                style={{ animationDelay: "0.3s" }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Image
                        src={getFlagSrc(selectedLanguage.countryCode)}
                        alt={selectedLanguage.name}
                        width={20}
                        height={16}
                        className="w-5 h-4 rounded-[2px] object-cover"
                      />
                      <span>{selectedLanguage.name}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-44">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Image
                          src={getFlagSrc(lang.countryCode)}
                          alt={lang.name}
                          width={20}
                          height={16}
                          className="w-5 h-4 rounded-[2px] object-cover"
                        />
                        <span>{lang.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      {t("login")}
                    </Button>
                  </Link>
                </div>
                <div className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/register">
                    <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                      {t("register")}
                    </Button>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

