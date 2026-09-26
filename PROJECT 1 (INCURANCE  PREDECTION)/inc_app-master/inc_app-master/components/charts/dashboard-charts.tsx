"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getCharts } from "@/lib/getCharts";
import { ChartsData } from "@/types/analysis";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const REGION_LABELS: Record<number, string> = {
  0: "Homs",
  1: "Lattakia",
  2: "Damascus",
  3: "Aleppo",
};

function formatCurrency(n: number) {
  return `${n.toLocaleString()} SYP`;
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface TooltipPayloadItem {
  name?: string;
  value: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label ?? payload[0].name}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.dataKey === "avg_cost" ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { predicted: number; actual: number };
  if (!d) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">Predicted: {formatCurrency(d.predicted)}</p>
      <p className="font-medium text-foreground">Actual: {formatCurrency(d.actual)}</p>
    </div>
  );
}

export default function DashboardCharts() {
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharts()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 animate-pulse"
          >
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="h-48 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: Cost by Age Group + Cost by Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cost by Age Group" subtitle="Average insurance cost per age bracket">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.costByAgeGroup} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k SYP`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avg_cost" name="Avg Cost" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost by Region" subtitle="Average insurance cost per region">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.costByRegion.map((r) => ({ ...r, region: REGION_LABELS[r.region] || `Region ${r.region}` }))}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k SYP`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avg_cost" name="Avg Cost" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Breakdown doughnuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Smoker" subtitle="Smoker vs Non-smoker">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.smokerBreakdown}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data.smokerBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender" subtitle="Female vs Male">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.genderBreakdown}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data.genderBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Diabetic" subtitle="Diabetic vs Non-diabetic">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.diabeticBreakdown}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data.diabeticBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[(i + 4) % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: BMI Distribution + Prediction vs Actual scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="BMI Distribution" subtitle="Average cost by BMI category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bmiDistribution} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k SYP`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avg_cost" name="Avg Cost" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Prediction vs Actual" subtitle="AI predicted cost vs final cost (completed clients)">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="predicted"
                name="Predicted"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k SYP`}
              />
              <YAxis
                dataKey="actual"
                name="Actual"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k SYP`}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={data.predictionVsActual} fill="var(--chart-4)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
