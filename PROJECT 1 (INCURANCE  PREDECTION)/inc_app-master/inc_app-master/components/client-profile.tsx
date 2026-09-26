"use client";

import { Client } from "@/types/client";
import { X, User, Heart, DollarSign, Activity } from "lucide-react";
import ComparePredictionsSection from "@/components/charts/compare-predictions";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";



type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className={`text-lg font-bold ${accent ?? "text-foreground"}`}>{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}

export default function ClientProfile({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const genderLabel = (g: number) => (g === 1 ? t("profile.male") : t("profile.female"));
  const yesNo = (v: number) => (v === 1 ? t("profile.yes") : t("profile.no"));

  const regionLabel = (r: number) => {
    const labels = [t("profile.homs"), t("profile.lattakia"), t("profile.damascus"), t("profile.aleppo")];
    return labels[r] ?? `Region ${r}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {client.customers_name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {client.email}
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

        <div className="px-6 py-5 space-y-6">
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<DollarSign className="w-4 h-4" />}
              label={t("profile.ai_prediction")}
              value={`${(client.AI_Prediction ?? 0).toLocaleString()} SYP`}
              accent="text-sky-500"
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4" />}
              label={t("profile.final_cost")}
              value={`${(client.final_cost ?? 0).toLocaleString()} SYP`}
              accent={client.isDone ? "text-emerald-500" : "text-amber-500"}
            />
            <StatCard
              icon={<Activity className="w-4 h-4" />}
              label={t("profile.bmi")}
              value={client.bmi.toFixed(1)}
            />
            <StatCard
              icon={<Heart className="w-4 h-4" />}
              label={t("profile.blood_pressure")}
              value={String(client.bloodpressure)}
            />
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {t("profile.personal_info")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoItem label={t("profile.age")} value={String(client.age)} />
              <InfoItem label={t("profile.gender")} value={genderLabel(client.gender)} />
              <InfoItem label={t("profile.email")} value={client.email} />
            </div>
          </div>

          {/* Health Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              {t("profile.health_metrics")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoItem label={t("profile.bmi")} value={client.bmi.toFixed(1)} />
              <InfoItem
                label={t("profile.blood_pressure")}
                value={String(client.bloodpressure)}
              />
              <InfoItem label={t("profile.diabetic")} value={yesNo(client.diabetic)} />
              <InfoItem label={t("profile.smoker")} value={yesNo(client.smoker)} />
              <InfoItem label={t("profile.children")} value={String(client.children)} />
              <InfoItem label={t("profile.region")} value={regionLabel(client.region)} />
            </div>
          </div>

          {/* Model Predictions Comparison */}
          <ComparePredictionsSection client={client} />

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              {t("profile.status")}
            </h3>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  client.isDone
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {client.isDone ? t("clients.done") : t("clients.pending")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 px-3.5 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}
