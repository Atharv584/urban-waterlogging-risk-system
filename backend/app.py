"""
FastAPI backend for Urban Waterlogging Risk Prediction System.
Loads a trained Random Forest model and serves predictions via REST API.
"""
import os
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Urban Waterlogging Risk Prediction API",
    description="ML-powered waterlogging risk assessment using Random Forest Classifier",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load model & features
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Support both local (backend/) and Vercel (root/) model locations
def _find_file(filename: str) -> str:
    candidates = [
        os.path.join(BASE_DIR, filename),                            # backend/
        os.path.join(BASE_DIR, '..', filename),                      # root/
        os.path.join(BASE_DIR, '..', 'backend', filename),           # root/backend/
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"{filename} not found. Searched: {candidates}")

MODEL_PATH    = _find_file("waterlogging_model.pkl")
FEATURES_PATH = _find_file("waterlogging_features.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(FEATURES_PATH, "rb") as f:
    feature_names: List[str] = pickle.load(f)

# Pre-compute feature importances
feature_importances = dict(
    zip(feature_names, [round(float(x), 4) for x in model.feature_importances_])
)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictionInput(BaseModel):
    Rainfall_1h_mm: float = Field(..., ge=0, le=200, description="Hourly rainfall in mm")
    Rainfall_24h_mm: float = Field(..., ge=0, le=500, description="Daily rainfall in mm")
    Drainage_Capacity_mm_h: float = Field(..., ge=0, le=100, description="Drainage capacity in mm/h")
    Elevation_m: float = Field(..., ge=0, le=200, description="Elevation in metres")
    Slope_degrees: float = Field(..., ge=0, le=45, description="Terrain slope in degrees")
    Soil_Saturation_pct: float = Field(..., ge=0, le=100, description="Soil saturation percentage")
    Impervious_Surface_pct: float = Field(..., ge=0, le=100, description="Impervious surface coverage percentage")
    Historical_Waterlogging: int = Field(..., ge=0, le=1, description="Historical waterlogging indicator (0 or 1)")


class PredictionResponse(BaseModel):
    prediction: str
    probabilities: Dict[str, float]
    feature_importances: Dict[str, float]
    input_summary: Dict[str, float]
    model_info: Dict[str, object]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "message": "Urban Waterlogging Risk Prediction API"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}


@app.get("/model-info")
async def model_info():
    return {
        "algorithm": "Random Forest Classifier",
        "n_estimators": int(model.n_estimators),
        "classes": model.classes_.tolist(),
        "n_features": len(feature_names),
        "feature_names": feature_names,
        "feature_importances": feature_importances,
        "training_samples": 10_000,
        "test_accuracy": 0.8295,
        "data_source": "Synthetic (10,000 observations)",
        "disclaimer": "This model uses synthetic data and is NOT validated for real-world emergency decisions.",
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionInput):
    try:
        input_values = [
            data.Rainfall_1h_mm,
            data.Rainfall_24h_mm,
            data.Drainage_Capacity_mm_h,
            data.Elevation_m,
            data.Slope_degrees,
            data.Soil_Saturation_pct,
            data.Impervious_Surface_pct,
            float(data.Historical_Waterlogging),
        ]

        X = np.array(input_values).reshape(1, -1)

        prediction = model.predict(X)[0]
        probas = model.predict_proba(X)[0]
        prob_dict = {
            cls: round(float(p), 4) for cls, p in zip(model.classes_, probas)
        }

        input_summary = {name: val for name, val in zip(feature_names, input_values)}

        return PredictionResponse(
            prediction=prediction,
            probabilities=prob_dict,
            feature_importances=feature_importances,
            input_summary=input_summary,
            model_info={
                "algorithm": "Random Forest Classifier",
                "n_estimators": int(model.n_estimators),
                "test_accuracy": 0.8295,
                "training_samples": 10_000,
                "data_source": "Synthetic",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Run directly with `python app.py`
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
