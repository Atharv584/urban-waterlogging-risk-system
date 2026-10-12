# 🌊 Urban Waterlogging Risk Prediction System

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

An end-to-end Machine Learning web application designed to evaluate urban flood and waterlogging risks using hydrological and environmental parameters. Built with a high-performance **Random Forest Classifier** trained on **10,000 observations** and an interactive, responsive dashboard styled with a clean light theme.

---

## ⚡ Key Features

- **Interactive Risk Prediction**: Real-time evaluation of flood vulnerability categorized into **Low**, **Medium**, or **High** risk levels.
- **Dynamic Scenario Presets**: 1-click presets for **Minimal Rainfall**, **Moderate Storm**, and **Monsoon Torrent** scenarios.
- **Hydrological Input Controls**: Precise range sliders and quick inputs for:
  - 🌧️ Hourly Rainfall ($0 - 150 \text{ mm}$)
  - 🌊 Daily Rainfall ($0 - 400 \text{ mm}$)
  - 🚰 Drainage Capacity ($0 - 100 \text{ mm/h}$)
  - ⛰️ Elevation ($0 - 150 \text{ m}$)
  - 📐 Terrain Slope ($0 - 20^\circ$)
  - 💧 Soil Saturation ($0 - 100\%$)
  - 🏗️ Impervious Surface Coverage ($0 - 100\%$)
  - 📋 Historical Waterlogging Indicator ($0 \text{ or } 1$)
- **Data Visualizations (Recharts)**:
  - Class Probability Distribution (Bar chart)
  - Random Forest Feature Importances (Bar chart)
  - Environmental Parameter Summary across operational ranges
- **Dual Inference Engine**:
  - **FastAPI / REST API**: Full Python ML service serving predictions with Scikit-learn.
  - **Client-Side Fallback Engine**: Native tree-ensemble evaluation for zero-downtime, instantaneous predictions when hosted statically on Vercel.
- **Academic Transparency**: Clear disclosure banner emphasizing synthetic data usage for educational purposes.

---

## 🧠 Machine Learning Model Specifications

| Parameter | Specification |
| :--- | :--- |
| **Model Type** | Random Forest Classifier |
| **Ensemble Size** | 100 Decision Trees |
| **Training Observations** | 10,000 synthetic samples |
| **Evaluation Accuracy** | **82.95%** test set accuracy |
| **Features Analyzed** | 8 hydrological & topographical attributes |
| **Target Classes** | `Low`, `Medium`, `High` |

> ⚠️ **Academic Disclaimer**: This model is trained on synthetic observations for college project demonstrations and is not validated for real-world emergency municipal planning or public safety evacuations.

---

## 📁 Project Structure

```text
urban2/
├── backend/                        # Python FastAPI Backend
│   ├── app.py                      # REST API endpoints (/predict, /model-info, /health)
│   ├── requirements.txt            # Python dependencies
│   ├── retrain_model.py            # Model training & serialization script
│   ├── waterlogging_model.pkl      # Trained Random Forest model
│   └── waterlogging_features.pkl   # Serialized feature column names
├── frontend/                       # React 19 + TypeScript + Vite Frontend
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── api.ts                  # API client with automatic fallback
│   │   ├── modelEngine.ts          # Embedded ML inference engine
│   │   ├── modelData.json          # Serialized decision tree parameters
│   │   ├── types.ts                # TypeScript definitions & constants
│   │   ├── App.tsx                 # Core application dashboard
│   │   ├── index.css               # Design system & styles
│   │   └── main.tsx                # React entrypoint
│   ├── index.html                  # HTML entrypoint with Plus Jakarta Sans & Inter
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── synthetic_waterlogging_dataset.csv # 10,000 sample dataset
├── vercel.json                     # Vercel deployment configuration
├── package.json                    # Root build orchestration
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Atharv584/urban-waterlogging-risk-system.git
cd urban-waterlogging-risk-system
```

### 2. Run the Backend API (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Run the Frontend (React + Vite)
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

---

## ☁️ Deploying to Vercel

### Method 1: Deploy with GitHub (Recommended)
1. Push this repository to your GitHub account (`https://github.com/Atharv584/urban-waterlogging-risk-system`).
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New...** > **Project**.
4. Import your `urban-waterlogging-risk-system` repository.
5. Vercel automatically detects the Vite framework and settings configured in `vercel.json`:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
6. Click **Deploy**. Your dashboard will be live with full ML prediction capabilities!

### Method 2: Deploy via Vercel CLI
```bash
npx vercel
# Follow the interactive prompts and accept the default settings
npx vercel --prod
```

---

## 🔌 API Reference

### `GET /health`
Returns system health status and confirms whether the model is loaded in memory.

### `GET /model-info`
Returns algorithmic metadata, feature importances, dataset description, and training accuracy.

### `POST /predict`
Evaluates environmental indicators and returns classification probabilities.

**Request Body**:
```json
{
  "Rainfall_1h_mm": 35.0,
  "Rainfall_24h_mm": 95.0,
  "Drainage_Capacity_mm_h": 40.0,
  "Elevation_m": 45.0,
  "Slope_degrees": 5.0,
  "Soil_Saturation_pct": 65.0,
  "Impervious_Surface_pct": 60.0,
  "Historical_Waterlogging": 0
}
```

**Response**:
```json
{
  "prediction": "Medium",
  "probabilities": {
    "Low": 0.08,
    "Medium": 0.74,
    "High": 0.18
  },
  "feature_importances": {
    "Rainfall_1h_mm": 0.2284,
    "Rainfall_24h_mm": 0.1843,
    "Drainage_Capacity_mm_h": 0.1712,
    "Elevation_m": 0.1205,
    "Soil_Saturation_pct": 0.1089,
    "Impervious_Surface_pct": 0.0984,
    "Slope_degrees": 0.0531,
    "Historical_Waterlogging": 0.0352
  }
}
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
