export interface PredictionInput {
  Rainfall_1h_mm: number;
  Rainfall_24h_mm: number;
  Drainage_Capacity_mm_h: number;
  Elevation_m: number;
  Slope_degrees: number;
  Soil_Saturation_pct: number;
  Impervious_Surface_pct: number;
  Historical_Waterlogging: number;
}

export interface PredictionResponse {
  prediction: 'Low' | 'Medium' | 'High';
  probabilities: Record<string, number>;
  feature_importances: Record<string, number>;
  input_summary: Record<string, number>;
  model_info: {
    algorithm: string;
    n_estimators: number;
    test_accuracy: number;
    training_samples: number;
    data_source: string;
  };
}

export interface ModelInfo {
  algorithm: string;
  n_estimators: number;
  classes: string[];
  n_features: number;
  feature_names: string[];
  feature_importances: Record<string, number>;
  training_samples: number;
  test_accuracy: number;
  data_source: string;
  disclaimer: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
};

export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  Low: 'rgba(34, 197, 94, 0.12)',
  Medium: 'rgba(245, 158, 11, 0.12)',
  High: 'rgba(239, 68, 68, 0.12)',
};

export const FEATURE_LABELS: Record<string, string> = {
  Rainfall_1h_mm: 'Hourly Rainfall (mm)',
  Rainfall_24h_mm: 'Daily Rainfall (mm)',
  Drainage_Capacity_mm_h: 'Drainage Capacity (mm/h)',
  Elevation_m: 'Elevation (m)',
  Slope_degrees: 'Slope (°)',
  Soil_Saturation_pct: 'Soil Saturation (%)',
  Impervious_Surface_pct: 'Impervious Surface (%)',
  Historical_Waterlogging: 'Historical Waterlogging',
};

export const FEATURE_ICONS: Record<string, string> = {
  Rainfall_1h_mm: '🌧️',
  Rainfall_24h_mm: '🌊',
  Drainage_Capacity_mm_h: '🚰',
  Elevation_m: '⛰️',
  Slope_degrees: '📐',
  Soil_Saturation_pct: '💧',
  Impervious_Surface_pct: '🏗️',
  Historical_Waterlogging: '📋',
};

export const DEFAULT_INPUT: PredictionInput = {
  Rainfall_1h_mm: 25,
  Rainfall_24h_mm: 70,
  Drainage_Capacity_mm_h: 50,
  Elevation_m: 50,
  Slope_degrees: 7,
  Soil_Saturation_pct: 55,
  Impervious_Surface_pct: 55,
  Historical_Waterlogging: 0,
};

export const FEATURE_RANGES: Record<string, { min: number; max: number; step: number; unit: string }> = {
  Rainfall_1h_mm:        { min: 0,  max: 150, step: 0.5,  unit: 'mm' },
  Rainfall_24h_mm:       { min: 0,  max: 400, step: 1,    unit: 'mm' },
  Drainage_Capacity_mm_h:{ min: 0,  max: 100, step: 0.5,  unit: 'mm/h' },
  Elevation_m:           { min: 0,  max: 150, step: 0.5,  unit: 'm' },
  Slope_degrees:         { min: 0,  max: 20,  step: 0.1,  unit: '°' },
  Soil_Saturation_pct:   { min: 0,  max: 100, step: 0.5,  unit: '%' },
  Impervious_Surface_pct:{ min: 0,  max: 100, step: 0.5,  unit: '%' },
  Historical_Waterlogging:{ min: 0, max: 1,   step: 1,    unit: '' },
};
