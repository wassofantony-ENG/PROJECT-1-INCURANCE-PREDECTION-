"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { Languages } from "lucide-react";

const LANG_KEY = "app-language";

function getInitialLang(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANG_KEY) || "en";
}

export function useLanguage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  function toggleLanguage() {
    const next = lang === "en" ? "ar" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  }

  return { lang, toggleLanguage };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = getInitialLang();
    document.documentElement.lang = saved;
    document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
  }, []);

  return <>{children}</>;
}

export function LanguageSwitcher() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
      aria-label="Toggle language"
      title={lang === "en" ? "العربية" : "English"}
    >
      <Languages className="w-4 h-4" />
    </button>
  );
}
