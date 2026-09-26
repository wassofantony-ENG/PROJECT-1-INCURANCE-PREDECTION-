"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/public/locales/en/translation.json";
import ar from "@/public/locales/ar/translation.json";

const savedLang =
  typeof window !== "undefined"
    ? localStorage.getItem("app-language") || "en"
    : "en";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18next;
