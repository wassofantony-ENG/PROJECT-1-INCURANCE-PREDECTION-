"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { getUserInfo } from "@/lib/getUserInfo";
import { PredictionForm } from "@/types/client";

type UploadRow = {
  customers_name: string;
  email: string;
} & PredictionForm;

type RowResult = {
  row: number;
  name: string;
  status: "success" | "error";
  error?: string;
};

function normalizeHeader(header: string): string {
  const map: Record<string, string> = {
    customers_name: "customers_name",
    name: "customers_name",
    customer_name: "customers_name",
    "client name": "customers_name",
    email: "email",
    age: "age",
    gender: "gender",
    bmi: "bmi",
    bloodpressure: "bloodpressure",
    blood_pressure: "bloodpressure",
    "blood pressure": "bloodpressure",
    diabetic: "diabetic",
    children: "children",
    smoker: "smoker",
    region: "region",
  };
  return map[header.toLowerCase().trim()] ?? header;
}

function parseRow(data: Record<string, unknown>): UploadRow | null {
  const normalized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    normalized[normalizeHeader(key)] = val;
  }

  const name = String(normalized.customers_name ?? "").trim();
  const email = String(normalized.email ?? "").trim();
  if (!name || !email) return null;

  const toNum = (v: unknown): number => {
    if (v === undefined || v === null || v === "") return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  return {
    customers_name: name,
    email,
    age: toNum(normalized.age),
    gender: toNum(normalized.gender),
    bmi: toNum(normalized.bmi),
    bloodpressure: toNum(normalized.bloodpressure),
    diabetic: toNum(normalized.diabetic),
    children: toNum(normalized.children),
    smoker: toNum(normalized.smoker),
    region: toNum(normalized.region),
  };
}

export function UploadClientsForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload");
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [results, setResults] = useState<RowResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const abortRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx", "xls"].includes(ext)) {
      setError("Unsupported file format. Please upload CSV or Excel files.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        setError("The file appears to be empty.");
        return;
      }
      const sheet = workbook.Sheets[sheetName];
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      if (raw.length === 0) {
        setError("No data rows found in the file.");
        return;
      }

      const parsed: UploadRow[] = [];
      for (let i = 0; i < raw.length; i++) {
        const row = parseRow(raw[i]);
        if (row) parsed.push(row);
      }

      if (parsed.length === 0) {
        setError(
          "No valid rows found. Make sure the file has columns: customers_name, email, age, gender, bmi, bloodpressure, diabetic, children, smoker, region."
        );
        return;
      }

      setRows(parsed);
      setTotalRows(parsed.length);
      setStep("upload");
    } catch {
      setError("Failed to read the file. Make sure it's a valid CSV or Excel file.");
    }
  }, []);

  async function handleStartProcessing() {
    setStep("processing");
    setProcessing(true);
    setCurrentIndex(0);
    setResults([]);
    setSuccessCount(0);
    setErrorCount(0);
    abortRef.current = false;

    const token = window.localStorage.getItem("authToken");
    if (!token) {
      setError("Not authenticated.");
      setStep("done");
      setProcessing(false);
      return;
    }

    let user: { id: number };
    try {
      user = await getUserInfo();
    } catch {
      setResults((prev) => [
        ...prev,
        {
          row: 0,
          name: "N/A",
          status: "error",
          error: "Failed to get user info",
        },
      ]);
      setStep("done");
      setProcessing(false);
      return;
    }

    const successes: RowResult[] = [];
    const errors: RowResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (abortRef.current) break;
      setCurrentIndex(i + 1);

      const row = rows[i];

      try {
        const predictPayload: PredictionForm = {
          age: row.age,
          gender: row.gender,
          bmi: row.bmi,
          bloodpressure: row.bloodpressure,
          diabetic: row.diabetic,
          children: row.children,
          smoker: row.smoker,
          region: row.region,
        };

        const predictRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/predict`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(predictPayload),
          }
        );

        if (!predictRes.ok) throw new Error("Prediction failed");

        const predictData = await predictRes.json();
        const prediction =
          predictData.AI_Prediction ??
          predictData.prediction ??
          predictData.cost ??
          0;

        const clientPayload = {
          user_id: Number(user.id),
          email: row.email,
          customers_name: row.customers_name,
          age: row.age,
          gender: row.gender,
          bmi: row.bmi,
          bloodpressure: row.bloodpressure,
          diabetic: row.diabetic,
          children: row.children,
          smoker: row.smoker,
          region: row.region,
          AI_Prediction: prediction,
          final_cost: 0,
          isDone: false,
        };

        const clientRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/clients/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(clientPayload),
          }
        );

        if (!clientRes.ok) throw new Error("Failed to create client");

        const result: RowResult = {
          row: i + 1,
          name: row.customers_name,
          status: "success",
        };
        successes.push(result);
        setSuccessCount(successes.length);
        setResults((prev) => [...prev, result]);
      } catch (err) {
        const result: RowResult = {
          row: i + 1,
          name: row.customers_name,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        };
        errors.push(result);
        setErrorCount(errors.length);
        setResults((prev) => [...prev, result]);
      }
    }

    setProcessing(false);
    setStep("done");
  }

  function handleAbort() {
    abortRef.current = true;
  }

  function handleClose() {
    if (processing && step === "processing") {
      if (!confirm("Stop processing and close?")) return;
      abortRef.current = true;
    }
    if (successCount > 0) window.location.reload();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-7 py-5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-sky-500" />
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Upload Clients
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-0.5">
                {step === "upload" &&
                  "Select a CSV or Excel file to bulk-import clients"}
                {step === "processing" &&
                  `Processing ${currentIndex} of ${totalRows}...`}
                {step === "done" &&
                  `${successCount} succeeded, ${errorCount} failed`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-7 py-6">
          {step === "upload" && (
            <div className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background/50 p-10 cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-sky-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {fileName || "Click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    CSV or Excel files (.csv, .xlsx, .xls)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Required Columns
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-mono">customers_name</span>
                  <span className="font-mono">email</span>
                  <span className="font-mono">age</span>
                  <span className="font-mono">gender (0/1)</span>
                  <span className="font-mono">bmi</span>
                  <span className="font-mono">bloodpressure</span>
                  <span className="font-mono">diabetic (0/1)</span>
                  <span className="font-mono">children</span>
                  <span className="font-mono">smoker (0/1)</span>
                  <span className="font-mono">region (0-3)</span>
                </div>
              </div>

              {rows.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Preview ({rows.length} rows)
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                            #
                          </th>
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                            Email
                          </th>
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                            Age
                          </th>
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                            BMI
                          </th>
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                            Region
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 10).map((row, i) => (
                          <tr
                            key={i}
                            className="border-t border-border hover:bg-muted/30"
                          >
                            <td className="px-3 py-2 text-muted-foreground">
                              {i + 1}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.customers_name}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.email}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.age}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.bmi}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.region}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 10 && (
                      <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                        ...and {rows.length - 10} more rows
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartProcessing}
                  disabled={rows.length === 0}
                  className="flex-1 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Start Upload ({rows.length} clients)
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    {currentIndex} / {totalRows}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-sky-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${(currentIndex / totalRows) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {successCount} success
                  </span>
                  <span className="text-red-500 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {errorCount} failed
                  </span>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    {r.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-muted-foreground text-xs min-w-[2rem]">
                      #{r.row}
                    </span>
                    <span className="text-foreground truncate flex-1">
                      {r.name}
                    </span>
                    {r.error && (
                      <span className="text-red-400 text-xs truncate max-w-[200px]">
                        {r.error}
                      </span>
                    )}
                  </div>
                ))}
                {processing && (
                  <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing row {currentIndex}...
                  </div>
                )}
              </div>

              <button
                onClick={handleAbort}
                className="w-full rounded-xl border border-red-500/30 px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 cursor-pointer"
              >
                Stop Processing
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-background/50 p-6 text-center">
                {errorCount === 0 ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                )}
                <p className="text-lg font-bold text-foreground">
                  {errorCount === 0
                    ? "All clients imported successfully!"
                    : `${successCount} of ${totalRows} imported`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {successCount > 0 &&
                    `${successCount} client${successCount > 1 ? "s" : ""} created`}
                  {errorCount > 0 &&
                    `, ${errorCount} failed`}
                </p>
              </div>

              {results.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      {r.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="text-muted-foreground text-xs min-w-[2rem]">
                        #{r.row}
                      </span>
                      <span className="text-foreground truncate flex-1">
                        {r.name}
                      </span>
                      {r.error && (
                        <span className="text-red-400 text-xs truncate max-w-[200px]">
                          {r.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-linear-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-sky-500 cursor-pointer"
              >
                {successCount > 0 ? "Done" : "Close"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
