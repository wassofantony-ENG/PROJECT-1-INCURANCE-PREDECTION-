"use client";
import { useEffect, useState } from "react";
import ClientsTable from "@/components/ClientsTable";
import DashboardCharts from "@/components/charts/dashboard-charts";
import { AnalysisResult } from "@/types/analysis";
import { get_analysis } from "@/lib/getAnalysis";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function DashboardHome() {
  const { t } = useTranslation();
  const [analysis, setAnalysisData] = useState<AnalysisResult>({} as AnalysisResult);

  useEffect(() => {
    get_analysis().then(setAnalysisData);
  }, []);

  return (
    <div className="max-w-[90%]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{t("dashboard.total_clients")}</p>
          <p className="text-3xl font-bold mt-1">{analysis.clients_num}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl font-bold mt-1">{analysis.final_value_set}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold mt-1">{analysis.clients_num? analysis.clients_num - analysis.final_value_set:0}</p>
        </div>
      </div>

      <DashboardCharts />

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-6">{t("dashboard.recent_activity")}</h2>
        <ClientsTable skip={0} limit={5} />
      </section>
    </div>
  );
}
