import { client } from "@gradio/client";

/**
 * API client for FastAPI/Gradio backend.
 * Uses VITE_API_URL.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? "https://aryank0-ccp-backend.hf.space";

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

// Singleton client to avoid reconnecting
let _gradioClient: any = null;
async function getClient() {
  if (!_gradioClient) {
    _gradioClient = await client(API_BASE);
  }
  return _gradioClient;
}

export async function apiPredict(data: PredictInput, model: ModelType = "final") {
  const app = await getClient();
  const endpoint = model === "final" ? "predict" : model;
  const result = await app.predict(`/${endpoint}`, [JSON.stringify(data)]);
  const parsed = JSON.parse(result.data[0] as string);
  if (parsed.status === "error") throw new Error(parsed.message);
  return parsed;
}

export async function apiFinal(data: PredictInput) {
  return apiPredict(data, "final");
}

export async function apiBenchmark(data: PredictInput) {
  return apiPredict(data, "benchmark");
}

export async function apiTest(data: PredictInput) {
  return apiPredict(data, "test");
}

export async function apiUpload(file: File, model: ModelType = "final") {
  const app = await getClient();
  // Gradio client automatically handles uploading the File object
  const result = await app.predict("/upload", [file]);
  
  // result.data[0] will contain the CSV string from the backend
  return { success: true, result: result.data[0] };
}
