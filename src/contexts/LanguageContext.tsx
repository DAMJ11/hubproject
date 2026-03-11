"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "es" | "en" | "fr";

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  countryCode: "es" | "gb" | "fr";
}

const STORAGE_KEY = "dashboard-language";

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "es", name: "Espanol", countryCode: "es" },
  { code: "en", name: "English", countryCode: "gb" },
  { code: "fr", name: "Francais", countryCode: "fr" },
];

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "es",
  setLanguage: () => {},
  languages: LANGUAGE_OPTIONS,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en" || stored === "fr") {
      setLanguageState(stored);
      document.documentElement.lang = stored;
      return;
    }

    const browserLang = window.navigator.language.toLowerCase();
    const guessed: AppLanguage = browserLang.startsWith("fr")
      ? "fr"
      : browserLang.startsWith("en")
        ? "en"
        : "es";

    setLanguageState(guessed);
    document.documentElement.lang = guessed;
  }, []);

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  };

  const value = useMemo(() => ({ language, setLanguage, languages: LANGUAGE_OPTIONS }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
