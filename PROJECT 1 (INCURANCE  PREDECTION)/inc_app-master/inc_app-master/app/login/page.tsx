"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { logIn } from "@/lib/auth";
import { useState } from "react";
import { LoginForm, TokenBody } from "@/types/auth";
import { AuthCard } from "@/components/auth-card";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<LoginForm>({} as LoginForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const token: TokenBody = await logIn(loginForm);
      if (!token.access_token) {
        setError("Invalid response from server");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <AuthCard
        title={t("auth.login_title")}
        subtitle={t("auth.login_subtitle")}
        footer={
          <>
            {t("auth.no_account")}{" "}
            <Link href="/register" className="text-sky-500 hover:text-sky-400">
              {t("auth.sign_up")}
            </Link>
          </>
        }
      >
        <form className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <label className="block">
            <span className="text-sm text-muted-foreground">{t("auth.email")}</span>
            <input
              type="email"
              required
              value={loginForm.email ?? ""}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">{t("auth.password")}</span>
            <input
              type="password"
              required
              value={loginForm.password ?? ""}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring"
              placeholder="••••••••"
            />
          </label>
          <button
          onClick={handleSubmit}
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.logging_in") : t("auth.login_button")}
          </button>
        </form>
      </AuthCard>
    </main>
  );
}
