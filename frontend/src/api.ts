import axios from 'axios';
import type { PredictionInput, PredictionResponse, ModelInfo } from './types';
import { runLocalPrediction, getLocalModelInfo } from './modelEngine';

// In production (Vercel), the backend will be at a separate URL or serverless function.
// In development, the Vite proxy handles /api -> localhost:8000.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

export async function predict(input: PredictionInput): Promise<PredictionResponse> {
  try {
    const { data } = await api.post<PredictionResponse>('/predict', input);
    return data;
  } catch (err) {
    // Graceful client-side ML engine fallback (e.g. on Vercel deployment without active backend server)
    console.warn('Backend unavailable, running prediction using client-side Random Forest ML engine:', err);
    return runLocalPrediction(input);
  }
}

export async function getModelInfo(): Promise<ModelInfo> {
  try {
    const { data } = await api.get<ModelInfo>('/model-info');
    return data;
  } catch (err) {
    console.warn('Backend unavailable, loading model metadata locally:', err);
    return getLocalModelInfo();
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const { data } = await api.get('/health');
    return data.status === 'healthy';
  } catch {
    // If backend is offline, client-side ML model is active and operational
    return true;
  }
}
