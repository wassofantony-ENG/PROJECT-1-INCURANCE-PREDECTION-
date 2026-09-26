"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/lib/getUserInfo";
import { UserInfo } from "@/types/auth";
import { Trash2, Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUserInfo()
      .then((u) => {
        setUser(u);
        setUsername(u.username);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleUpdateUsername() {
    if (!user || !username.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const token = window.localStorage.getItem("authToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: username.trim()}),
        }
      );
      if (!res.ok) throw new Error("Failed to update username");
      setMessage("Username updated successfully");
    } catch {
      setMessage("Failed to update username");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      const token = window.localStorage.getItem("authToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete account");
      window.localStorage.removeItem("authToken");
      router.push("/login");
    } catch {
      setMessage("Failed to delete account");
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details.</p>
      </div>

      <div className="space-y-6">
        {/* User info card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Change username */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Change Username
          </h2>
          <label className="block">
            <span className="text-sm text-muted-foreground">Username</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
            />
          </label>
          <button
            onClick={handleUpdateUsername}
            disabled={saving || !username.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <p
              className={`mt-3 text-sm ${
                message.includes("successfully")
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Delete account */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-400 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
