"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { PredictionForm } from "@/types/client";
import { getUserInfo } from "@/lib/getUserInfo";

const personalFields: { key: keyof PredictionForm; label: string }[] = [
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "children", label: "Children" },
  { key: "region", label: "Region" },
];

const healthFields: { key: keyof PredictionForm; label: string }[] = [
  { key: "bmi", label: "BMI" },
  { key: "bloodpressure", label: "Blood Pressure" },
  { key: "diabetic", label: "Diabetic" },
  { key: "smoker", label: "Smoker" },
];

function ToggleSwitch({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const on = value === 1;
  return (
    <button
      type="button"
      onClick={() => onChange(on ? 0 : 1)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 cursor-pointer ${
        on ? "bg-sky-500" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none rounded-xl border border-border bg-background/80 px-4 py-2.5 pr-10 text-sm text-foreground outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export function AddClientForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"predict" | "result">("predict");
  const [form, setForm] = useState<PredictionForm>({
    email: "",
    age: 0,
    gender: 0,
    bmi: 0,
    bloodpressure: 0,
    diabetic: 0,
    children: 0,
    smoker: 0,
    region: 0,
  });
  const [name, setName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof PredictionForm, value: number | string) {
    setForm((prev) => ({ ...prev, [key]: value as never }));
  }

  async function handleGetPrediction(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = window.localStorage.getItem("authToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Prediction request failed");
      const data = await res.json();
      setPrediction(data.AI_Prediction ?? data.prediction ?? data.cost ?? 0);
      setStep("result");
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClient() {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("authToken");
      const user = await getUserInfo();

      const payload = {
        user_id: Number(user.id),
        email: clientEmail,
        customers_name: name,
        age: form.age,
        gender: form.gender,
        bmi: form.bmi,
        bloodpressure: form.bloodpressure,
        diabetic: form.diabetic,
        children: form.children,
        smoker: form.smoker,
        region: form.region,
        AI_Prediction: prediction,
        final_cost: 0,
        isDone: false,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to create client");
      onClose();
      window.location.reload();
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }

  if (step === "result") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-lg rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-border px-7 py-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("predict")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Prediction Result
                </h2>
                <p className="text-sm text-muted-foreground/70 mt-0.5">
                  Review and complete the client details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-7 py-6 space-y-6">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 text-center">
              <Sparkles className="w-6 h-6 text-sky-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Estimated Insurance Cost
              </p>
              <p className="text-3xl font-bold text-foreground">
                {prediction?.toLocaleString()} SYP
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">
                  Customer Name
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClient}
                disabled={loading || !name || !clientEmail}
                className="flex-1 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Client"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-7 py-5 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Client</h2>
            <p className="text-sm text-muted-foreground/70 mt-0.5">
              Fill in the details to get a prediction
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGetPrediction} className="px-7 py-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Personal Information
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {field.label}
                  </label>
                  {field.key === "gender" || field.key === "region" ? (
                    <SelectField
                      value={form[field.key] ?? 0}
                      options={
                        field.key === "gender"
                          ? [
                              { label: "Female", value: 0 },
                              { label: "Male", value: 1 },
                            ]
                          : [
                              { label: "Homs", value: 0 },
                              { label: "Lattakia", value: 1 },
                              { label: "Damascus", value: 2 },
                              { label: "Aleppo", value: 3 },
                            ]
                      }
                      onChange={(v) => update(field.key, v)}
                    />
                  ) : (
                    <input
                      type="number"
                      required
                      min={0}
                      max={field.key === "age" ? 120 : undefined}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        update(
                          field.key,
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Health Information
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {healthFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {field.label}
                  </label>
                  {field.key === "diabetic" || field.key === "smoker" ? (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background/80 px-4 py-2.5">
                      <span className="text-sm text-muted-foreground">
                        {field.key === "diabetic" ? "Diabetic" : "Smoker"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium transition-colors ${
                            (form[field.key] as number) === 0
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          No
                        </span>
                        <ToggleSwitch
                          value={form[field.key] as number}
                          onChange={(v) => update(field.key, v)}
                        />
                        <span
                          className={`text-xs font-medium transition-colors ${
                            (form[field.key] as number) === 1
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          Yes
                        </span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      required
                      min={0}
                      step={field.key === "bmi" ? "0.1" : undefined}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        update(
                          field.key,
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring/30"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-linear-to-r from-violet-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-400 hover:to-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Predicting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Get Prediction
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
