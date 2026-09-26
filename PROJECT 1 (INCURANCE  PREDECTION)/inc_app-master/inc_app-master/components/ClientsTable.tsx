"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Client } from "@/types/client";
import { Eye, Pencil, Trash2, X, Search, SlidersHorizontal } from "lucide-react";
import getClients from "@/lib/getClients";
import ClientProfile from "@/components/client-profile";
import Fuse, { IFuseOptions } from "fuse.js";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const fuseOptions: IFuseOptions<Client> = {
  keys: ["customers_name", "email"],
  threshold: 0.4,
  distance: 100,
};

type Filters = {
  status: "all" | "done" | "pending";
  minAge: string;
  maxAge: string;
};

const defaultFilters: Filters = {
  status: "all",
  minAge: "",
  maxAge: "",
};

export default function ClientsTable({
  skip,
  limit,
}: {
  skip: number;
  limit: number;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [finalCost, setFinalCost] = useState("");
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const token = window.localStorage.getItem("authToken");
    if (!token) return;

    getClients(token, skip, limit)
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [skip, limit]);

  const fuse = useMemo(() => new Fuse(clients, fuseOptions), [clients]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (filters.status !== "all") count++;
    if (filters.minAge) count++;
    if (filters.maxAge) count++;
    return count;
  }, [searchQuery, filters]);

  const filteredClients = useMemo(() => {
    let result = clients;

    if (searchQuery) {
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    if (filters.status === "done") {
      result = result.filter((c) => c.isDone);
    } else if (filters.status === "pending") {
      result = result.filter((c) => !c.isDone);
    }

    if (filters.minAge) {
      result = result.filter((c) => c.age >= Number(filters.minAge));
    }
    if (filters.maxAge) {
      result = result.filter((c) => c.age <= Number(filters.maxAge));
    }

    return result;
  }, [clients, searchQuery, fuse, filters]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilters(defaultFilters);
  }, []);

  async function handleDelete(client: Client) {
    if (!window.confirm(t("clients.delete_confirm", { name: client.customers_name }))) return;
    try {
      const token = window.localStorage.getItem("authToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/${client.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete");
      setClients((prev) => prev.filter((c) => c.id !== client.id));
    } catch {
      // silently handled
    }
  }

  async function handleEditDone() {
    if (!editClient || !finalCost) return;
    try {
      const token = window.localStorage.getItem("authToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/Done/${editClient.id}?final_cost=${Number(finalCost)}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      setClients((prev) =>
        prev.map((c) =>
          c.id === editClient.id
            ? { ...c, final_cost: Number(finalCost), isDone: true }
            : c
        )
      );
      setEditClient(null);
      setFinalCost("");
    } catch {
      // silently handled
    }
  }

  const statusBadge = (client: Client) => {
    if (client.isDone) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-500">
          {t("clients.done")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-500">
        {t("clients.pending")}
      </span>
    );
  };

  return (
    <div>
      {loading && <p className="text-muted-foreground">{t("clients.loading")}</p>}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search & Filter Bar */}
          <div className="mb-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("clients.search_placeholder")}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  showAdvanced || activeFilterCount > (searchQuery ? 1 : 0)
                    ? "border-sky-500/40 bg-sky-500/10 text-sky-500"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("clients.filters")}
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t("clients.advanced_filters")}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Status */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t("clients.status")}
                    </label>
                    <div className="flex items-center gap-2">
                      {(["all", "done", "pending"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: s }))
                          }
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer capitalize ${
                            filters.status === s
                              ? "bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/30"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t(`clients.${s}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t("clients.age_range")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={filters.minAge}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minAge: e.target.value,
                          }))
                        }
                        placeholder={t("clients.min")}
                        className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                      />
                      <span className="text-muted-foreground text-sm">{t("clients.to")}</span>
                      <input
                        type="number"
                        min={0}
                        value={filters.maxAge}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxAge: e.target.value,
                          }))
                        }
                        placeholder={t("clients.max")}
                        className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                      />
                    </div>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                  >
                    {t("clients.clear_all")}
                  </button>
                )}
              </div>
            )}

            {/* Result count */}
            <p className="text-xs text-muted-foreground">
              {t("clients.showing", { count: filteredClients.length, total: clients.length })}
            </p>
          </div>

          {filteredClients.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || activeFilterCount > 0
                  ? t("clients.no_match")
                  : t("clients.no_clients")}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-4 font-medium">{t("clients.table_name")}</th>
                      <th className="px-4 py-4 font-medium">{t("clients.table_email")}</th>
                      <th className="px-4 py-4 font-medium">{t("clients.table_age")}</th>
                      <th className="px-4 py-4 font-medium">{t("clients.table_prediction")}</th>
                      <th className="px-4 py-4 font-medium">{t("clients.table_cost")}</th>
                      <th className="px-4 py-4 font-medium">{t("clients.table_status")}</th>
                      <th className="px-4 py-4 font-medium">{t("clients.table_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-foreground font-medium">
                          {client.customers_name}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {client.email}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {client.age}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sky-500">
                            {(client.AI_Prediction ?? 0).toLocaleString()} SYP
                          </span>
                        </td>
                        <td className="px-4 py-4 text-foreground font-medium">
                          {(client.final_cost ?? 0).toLocaleString()} SYP
                        </td>
                        <td className="px-4 py-4">{statusBadge(client)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setProfileClient(client)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
                              title="View profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditClient(client);
                                setFinalCost(String(client.final_cost));
                              }}
                              className="p-2 rounded-lg text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(client)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Client Profile modal */}
      {profileClient && (
        <ClientProfile
          client={profileClient}
          onClose={() => setProfileClient(null)}
        />
      )}

      {/* Edit final cost modal */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">
                {t("clients.edit_title")}
              </h2>
              <button
                onClick={() => setEditClient(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("clients.edit_client")}{" "}
                <span className="text-foreground font-medium">
                  {editClient.customers_name}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {t("clients.edit_prediction")}{" "}
                <span className="text-foreground font-medium">
                  {editClient.AI_Prediction} SYP
                </span>
              </p>
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("clients.edit_cost")}
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="0"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditClient(null)}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted cursor-pointer"
                >
                  {t("clients.edit_cancel")}
                </button>
                <button
                  onClick={handleEditDone}
                  disabled={!finalCost}
                  className="flex-1 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t("clients.edit_save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
