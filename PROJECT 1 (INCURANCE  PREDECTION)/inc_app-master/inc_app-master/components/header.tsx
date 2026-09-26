"use client";

import Link from "next/link";
import { Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { LanguageSwitcher } from "@/components/language-provider";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow duration-300">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {t("app.name")}
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        <a
          href="#features"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("header.features")}
        </a>
        <a
          href="#pricing"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("header.pricing")}
        </a>
        <a
          href="#"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("header.docs")}
        </a>
      </nav>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("header.sign_in")}
        </Link>
        <Link
          href="/register"
          className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/10"
        >
          {t("header.get_started")}
        </Link>
      </div>
    </header>
  );
}
