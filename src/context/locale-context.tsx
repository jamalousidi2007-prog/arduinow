"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Locale } from "@/lib/types";
import { getLabel, type TranslationKey } from "@/lib/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("app-locale");
    return stored === "fr" || stored === "en" ? stored : "en";
  });

  const setLocale = useCallback((value: Locale) => {
    setLocaleState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app-locale", value);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => getLabel(locale, key),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
};

