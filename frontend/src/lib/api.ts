/**
 * API client for FastAPI backend.
 * Uses VITE_API_URL (or relative /api for same-origin on Vercel).
 * Three notebook models: final, benchmark, test
 */
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type ModelType = "final" | "benchmark" | "test";

interface PredictInput {
  gender: string;
  seniorCitizen?: number;
  partner?: string;
  dependents?: string;
  tenure: number;
  phoneService?: string;
  multipleLines?: string;
  internetService: string;
  onlineSecurity?: string;
  deviceProtection?: string;
  techSupport: string;
  streamingTV?: string;
  streamingMovies?: string;
  contractType: string;
  paperlessBilling?: string;
  paymentMethod: string;
  monthlyCharges: number;
  totalCharges?: number;
}

export async function apiPredict(data: PredictInput, model: ModelType = "final") {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, model }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiFinal(data: PredictInput) {
  const res = await fetch(`${API_BASE}/api/final`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiBenchmark(data: PredictInput) {
  const res = await fetch(`${API_BASE}/api/benchmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiTest(data: PredictInput) {
  const res = await fetch(`${API_BASE}/api/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiUpload(file: File, model: ModelType = "final") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", model);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
