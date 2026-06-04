"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { dict, type Dict, type Locale } from "@/lib/i18n";

type I18nValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: Dict;
};

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "mystic-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English on first paint (matches server render); hydrate the
  // saved preference in an effect to avoid a hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "zh") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggle = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "en" ? "zh" : "en";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, toggle, t: dict[locale] }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx)
    throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
