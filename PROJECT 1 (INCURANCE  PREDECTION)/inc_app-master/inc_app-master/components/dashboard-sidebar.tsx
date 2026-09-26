"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  LogOut,
  Zap,
  Plus,
  Upload,
  List,
  Settings,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const avatarColors = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function DashboardSidebar({
  username,
  email,
  onAddClient,
  onUploadClients,
}: {
  username: string;
  email: string;
  onAddClient?: () => void;
  onUploadClients?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { lang, toggleLanguage } = useLanguage();
  const [clientsOpen, setClientsOpen] = useState(true);
  const initial = username.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(username);

  function handleSignOut() {
    if(!window.confirm(t("sidebar.sign_out_confirm"))) return 
    window.localStorage.removeItem("authToken");
    router.push("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-linear-to-r from-sidebar-foreground to-sidebar-foreground/60 bg-clip-text text-transparent">
          {t("app.name")}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${pathname === "/dashboard"
              ? "text-sidebar-accent-foreground bg-sidebar-accent"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          {t("sidebar.home")}
        </Link>

        <div>
          <button
            onClick={() => setClientsOpen(!clientsOpen)}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              {t("sidebar.clients")}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${clientsOpen ? "rotate-0" : "-rotate-90"}`}
            />
          </button>

          {clientsOpen && (
            <div className="mr-4 mt-1 space-y-1 border-r border-sidebar-border pr-3">
              <button
                onClick={onAddClient}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t("sidebar.add_client")}
              </button>
              <button
                onClick={onUploadClients}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {t("sidebar.upload_clients")}
              </button>
              <Link
                href="/dashboard/clients"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${pathname === "/dashboard/clients"
                    ? "text-sidebar-accent-foreground bg-sidebar-accent"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                <List className="w-4 h-4" />
                {t("sidebar.all_clients")}
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            pathname === "/dashboard/settings"
              ? "text-sidebar-accent-foreground bg-sidebar-accent"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Settings className="w-5 h-5" />
          {t("sidebar.profile_settings")}
        </Link>
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div
            className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-sm font-bold text-white shrink-0`}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{username}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">User@example.com</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === "dark" ? t("sidebar.light_mode") : t("sidebar.dark_mode")}
        </button>
        <button
          onClick={toggleLanguage}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
        >
          <Languages className="w-5 h-5" />
          {lang === "en" ? "English" : "العربية"}
        </button>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          {t("sidebar.sign_out")}
        </button>
      </div>
    </aside>
  );
}
