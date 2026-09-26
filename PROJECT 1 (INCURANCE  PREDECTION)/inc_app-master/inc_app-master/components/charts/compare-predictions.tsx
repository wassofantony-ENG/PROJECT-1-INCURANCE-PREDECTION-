"use client";

import { useEffect, useState } from "react";
import { Client, ComparePredictions } from "@/types/client";
import { getComparePredictions } from "@/lib/getComparePredictions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

function formatCurrency(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0 SYP";
  return `${n.toLocaleString()} SYP`;
}

interface TooltipPayloadItem {
  name?: string;
  value: number;
  color?: string;
  dataKey?: string;
}

function PredTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function ComparePredictionsSection({
  client,
}: {
  client: Client;
}) {
  const { t } = useTranslation();
  const [data, setData] = useState<ComparePredictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getComparePredictions({
      age: client.age,
      gender: client.gender,
      bmi: client.bmi,
      bloodpressure: client.bloodpressure,
      diabetic: client.diabetic,
      children: client.children,
      smoker: client.smoker,
      region: client.region,
    })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client]);

  const results = data?.results ?? [];
  const highest = Math.max(...results.map((r) => r.result));
  const lowest = Math.min(...results.map((r) => r.result));

  const chartData = results.map((r) => ({
    name: r.name,
    Prediction: r.result,
    isHighest: r.result === highest,
    isLowest: r.result === lowest,
  })) ?? [];

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4 text-muted-foreground" />
        {t("profile.model_predictions")}
      </h3>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-36 bg-muted rounded" />
          <div className="h-44 bg-muted rounded-xl" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {data && !error && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/50 p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k SYP`}
                />
                <Tooltip content={<PredTooltip />} />
                <Bar
                  dataKey="Prediction"
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.isHighest
                          ? "var(--chart-3)"
                          : entry.isLowest
                            ? "var(--chart-5)"
                            : "var(--chart-2)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {results.map((m) => (
              <ModelCard
                key={m.name}
                name={m.name}
                result={m.result}
                score={m.score}
                description={m.description}
                current={client.AI_Prediction}
                isHighest={m.result === highest}
                isLowest={m.result === lowest}
              />
            ))}
          </div>

          <div className="rounded-lg border border-border bg-background/30 px-3.5 py-2.5">
            <p className="text-xs text-muted-foreground">
              {t("profile.current_prediction")}
            </p>
            <p className="text-sm font-bold text-sky-500 mt-0.5">
              {formatCurrency(client.AI_Prediction)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ModelCard({
  name,
  result,
  score,
  description,
  current,
  isHighest,
  isLowest,
}: {
  name: string;
  result: number;
  score: number;
  description: string;
  current: number;
  isHighest: boolean;
  isLowest: boolean;
}) {
  const { t } = useTranslation();
  const diff = (result ?? 0) - (current ?? 0);
  const absDiff = Math.abs(diff);
  const pct = current ? ((diff / current) * 100).toFixed(1) : "0";
  const isHigher = diff > 0;

  const borderColor = isHighest
    ? "border-emerald-500/40"
    : isLowest
      ? "border-amber-500/40"
      : "border-border";

  const bgAccent = isHighest
    ? "bg-emerald-500/5"
    : isLowest
      ? "bg-amber-500/5"
      : "bg-background/30";

  return (
    <div
      className={`rounded-lg border ${borderColor} ${bgAccent} p-3 space-y-1.5 relative`}
    >
      {isHighest && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          {t("profile.highest")}
                        </div>
                      )}
                      {isLowest && (
                        <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                          <TrendingDown className="w-3 h-3" />
                          {t("profile.lowest")}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">{name}</p>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {score}%
        </span>
      </div>
      <p className="text-sm font-bold text-foreground">
        {formatCurrency(result)}
      </p>
      <p
        className={`text-[10px] ${isHigher ? "text-amber-500" : "text-emerald-500"}`}
      >
        {isHigher ? "+" : ""}
        {formatCurrency(absDiff)} ({isHigher ? "+" : ""}
        {pct}%)
      </p>
      <p className="text-[10px] text-muted-foreground leading-tight">
        {description}
      </p>
    </div>
  );
}
