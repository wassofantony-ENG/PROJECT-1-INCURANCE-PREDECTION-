"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { register } from "@/lib/auth";
import { RegisterForm, TokenBody } from "@/types/auth";
import { AuthCard } from "@/components/auth-card";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({} as RegisterForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const token: TokenBody = await register(form);
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
        title={t("auth.register_title")}
        subtitle={t("auth.register_subtitle")}
        footer={
          <>
            {t("auth.has_account")}{" "}
            <Link href="/login" className="text-sky-500 hover:text-sky-400">
              {t("auth.login_button")}
            </Link>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <label className="block">
            <span className="text-sm text-muted-foreground">{t("auth.username")}</span>
            <input
              type="text"
              required
              value={form.username ?? ""}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">{t("auth.email")}</span>
            <input
              type="email"
              required
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">{t("auth.password")}</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password ?? ""}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.creating_account") : t("auth.register_button")}
          </button>
        </form>
      </AuthCard>
    </main>
  );
}
