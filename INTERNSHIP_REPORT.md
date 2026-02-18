# HarvestIQ — Internship Project Report

**Project:** HarvestIQ — AI-Powered Farmer Decision Support System  
**Report sections:** Work Performed | Challenges & Learning | Project Implementation

---

## 1. Work Performed During Internship

### 1.1 Backend & ML Services (Python/Flask)

- **ML pipeline and model training**
  - Designed and implemented an **enhanced crop cycle prediction system** using scikit-learn (Random Forest) for yield and phenology (days to maturity, germination, reproductive, grain filling).
  - Prepared and used the **large_agri_dataset.csv** (crop type, sowing date, temperatures, actual yield, growth-stage dates) for training; implemented feature engineering (Avg_Temp, Tmax, Tmin, crop-type one-hot encoding).
  - Built a **multi-model pipeline**: one yield regression model and multiple phenology models; integrated GDD-based growth stage logic and harvest windows for Rice, Wheat, Maize, Cotton, Soybean, Sugarcane.
  - Implemented **model persistence** (pickle) and **auto-train on startup** when the model file is missing; added a **/train** API to retrain from a configurable dataset path.

- **REST API development**
  - Developed a **Flask REST API** with CORS for frontend consumption.
  - **Endpoints implemented:**  
    - `/health` — service and model availability check.  
    - `/predict` — crop yield prediction and crop cycle (growth stages, dates, explanation text, feature importances).  
    - `/irrigation` — rule-based irrigation schedule (2-week windows, mm, reasons) and water-savings percentage using weekly forecast, soil profile, and crop cycle.  
    - `/irrigation/llm` — optional Gemini-powered irrigation schedule with JSON parsing and fallback to rule-based on failure.  
    - `/gemini` — agricultural Q&A using Google Gemini (e.g. gemini-1.5-flash).  
    - `/train` — on-demand model retraining and metrics return.
  - Handled **error handling**, **validation**, and **environment-based configuration** (model path, dataset path, API keys).

- **Irrigation logic**
  - Implemented **rule-based irrigation scheduling** using crop growth stage, 7-day weather (temp, rain), soil type, pH, drainage, and organic matter to produce actionable weekly recommendations (Irrigate/Skip, amount in mm, reason).
  - Integrated **LLM-based irrigation** via Gemini with strict JSON output and fallback to rule-based when Gemini is unavailable or response is invalid.

- **AI integration**
  - Integrated **Google Gemini API** for (1) chat-based agricultural advice (`/gemini`) and (2) LLM irrigation schedule (`/irrigation/llm`); used prompt engineering and JSON extraction with robust fallbacks.

### 1.2 Frontend (React/TypeScript)

- **Dashboard and user flows**
  - Built the main **Dashboard** that orchestrates: district/crop/season/sowing date selection, soil inputs (type, pH, organic matter, drainage), “Generate Forecast” flow, and display of yield, risk, irrigation, and crop lifecycle.
  - Integrated **WeatherAPI** for 7-day forecast by district; implemented fallback to mock data when API key is not set; built weather trend data for charts.
  - Wired **ML API client** (`mlClient.ts`) to call `/predict` and `/irrigation` (and optional `/irrigation/llm`); combined ML output with weather and soil to compute risk and render irrigation panel, water budget, and farmer tips.

- **UI components and UX**
  - Implemented **ControlPanel** (district, crop, season, sowing date, soil, scenario), **DashboardCards** (yield, risk, irrigation schedule, water savings), **InsightsPanel**, **CropLifecycle** (growth stages and timeline), **IndiaMap** and **MapPickerDialog** for district selection, **PredictionHistory** (Supabase), **Header** (PDF export, history toggle).
  - Used **Shadcn UI** (Radix primitives), **Tailwind CSS**, **Recharts** for visualizations, **Leaflet/react-leaflet** for map; ensured responsive layout and clear information hierarchy for field-friendly use.

- **State management and integration**
  - Managed local state for form inputs, forecast data, ML response, and LLM irrigation; built **GeminiContext** to pass current session context (district, crop, soil, weather, yield, risk, irrigation) into the chat widget for context-aware AI answers.
  - Integrated **Supabase** for authentication and saving/loading prediction history; implemented **AuthContext**, **ProtectedRoute**, and history list with delete.

- **Chat and PDF**
  - Implemented **ChatWidget** that calls backend `/gemini` with user prompt and optional API key; used **GeminiContext** so the AI can reference current crop, soil, and predictions.
  - Implemented **PDF export** of the dashboard using html2pdf.js (one-page summary of yield, risk, irrigation).

- **i18n and auth**
  - Set up **I18nContext** for language/translations; integrated **Auth** page and **ProtectedRoute** so the dashboard is accessible after login.

### 1.3 Data and DevOps

- **Data preparation**
  - Used and understood **large_agri_dataset.csv**; worked with scripts such as **prepare_agri_ml_data.py** that merge yield and weather data and add synthetic features (NDVI, soil) for training variants.
  - Ensured dataset schema alignment with **integrated_crop_prediction_training.py** (column names, dtypes, targets).

- **Configuration and documentation**
  - Configured **environment variables** for frontend (Vite) and backend (.env): ML API URL, Weather API, Gemini, Supabase.
  - Documented **README**, **PROJECT_SUMMARY_AND_VIVA.md**, and this **INTERNSHIP_REPORT** for setup, architecture, and viva.

---

## 2. Challenges and Learning Experience

### 2.1 Technical Challenges

| Challenge | Approach & Learning |
|-----------|----------------------|
| **Aligning ML features with real-world inputs** | At sowing time, only limited inputs (crop, temps, date) are available. I learned to restrict features to **sowing-time-only** (Avg_Temp, Tmax, Tmin, crop) and use phenology models to derive growth stages and dates for irrigation and UI, rather than using future-only features. |
| **Irrigation logic without over-relying on LLM** | Requirement was a reliable, explainable schedule. I implemented **rule-based irrigation first** (crop stage, forecast, soil), then added **optional LLM enhancement** with strict JSON schema and fallback. Learned to design for **offline/fallback** and keep core logic deterministic. |
| **Gemini response parsing** | LLM sometimes returned markdown or extra text around JSON. I added **multiple parsing strategies** (```json block, raw JSON, heuristic `{...}` extraction) and always **fallback to rule-based** on parse failure, improving robustness. |
| **Frontend–backend contract** | Keeping request/response shapes consistent between Flask and React (e.g. crop_cycle, soil_profile, weekly_forecast). I defined **TypeScript interfaces** in `mlClient.ts` and **documented API** in README; learned the importance of **typed API clients** and single source of truth for payloads. |
| **Weather API failure handling** | When WeatherAPI key is missing or rate-limited, the app must still work. I implemented **mock fallback** and clear toasts so the user understands when live weather is unavailable; learned **graceful degradation** in production UIs. |
| **Model loading and training on startup** | If the pickle file is missing, the server should train from CSV. I added **conditional load → train → save** at startup and proper **error handling** so the service reports “model not loaded” instead of crashing; learned **operational resilience** for ML services. |

### 2.2 Soft Skills & Process Learning

- **Breaking down scope:** Delivered in phases — ML + API first, then dashboard, then irrigation, then Gemini chat and LLM irrigation — which made the project manageable and testable.
- **Documentation and maintainability:** Writing README, env examples, and inline comments helped onboarding and viva prep; learned that good docs are part of the deliverable.
- **Security and keys:** Kept API keys in environment variables and .env (not committed); used optional client-side key for Gemini only where required; learned **secrets management** in full-stack apps.

### 2.3 Key Learnings Summary

- **ML in production:** From training script to deployable API (load/save, health check, retrain endpoint) and how to keep features aligned with real user inputs.
- **Hybrid AI systems:** Combining **deterministic rules** (irrigation, risk) with **LLM** (chat, optional irrigation enrichment) and handling failures gracefully.
- **Full-stack flow:** End-to-end flow from UI → Weather API + ML API → state update → charts and PDF; importance of clear data flow and error states.
- **Farmer-centric design:** Presenting yield, risk, and irrigation in simple language and units (mm, L/ha, L/acre) so the system is usable in the field.

---

## 3. Project Implementation

### 3.1 Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Frontend (Vite + React + TypeScript)                                    │
│  • Dashboard: ControlPanel, DashboardCards, InsightsPanel, CropLifecycle│
│  • Weather: WeatherAPI (7-day forecast) or mock                          │
│  • ML client: /predict, /irrigation, /irrigation/llm                     │
│  • Chat: ChatWidget → /gemini with GeminiContext                         │
│  • Auth & History: Supabase                                              │
│  • Export: html2pdf.js                                                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP (JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Backend (Flask, Python)                                                  │
│  • /health     → model loaded check                                       │
│  • /predict   → EnhancedCropCyclePredictionModel (yield + crop cycle)     │
│  • /irrigation → rule-based schedule (forecast + soil + crop_cycle)       │
│  • /irrigation/llm → Gemini schedule (with rule-based fallback)           │
│  • /gemini    → Gemini agricultural Q&A                                  │
│  • /train     → retrain from CSV, save pickle                             │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ML Layer (integrated_crop_prediction_training.py)                        │
│  • Yield model: RandomForestRegressor (Avg_Temp, Tmax, Tmin, crop dummies)│
│  • Phenology models: Days_To_Maturity, Germination, Reproductive, etc.   │
│  • Phenology data: growth stages, GDD, harvest window per crop           │
│  • Dataset: large_agri_dataset.csv                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Vite, React 18, TypeScript, Tailwind CSS, Shadcn UI (Radix), React Router, Recharts, Leaflet/react-leaflet, React Hook Form + Zod, TanStack React Query, Supabase, html2pdf.js, Lucide, Sonner |
| **Backend** | Flask, Flask-CORS, python-dotenv |
| **ML** | pandas, numpy, scikit-learn (Random Forest), pickle |
| **AI** | google-generativeai (Gemini) |
| **External APIs** | WeatherAPI (weatherapi.com) |
| **Data** | large_agri_dataset.csv, optional AgriML_training_data.csv, Processed_AgriWeather, dld_yield_complete |

### 3.3 Implementation Highlights

- **Single “Generate Forecast” flow:** User inputs → fetch weather (if configured) → call `/predict` → call `/irrigation` (or `/irrigation/llm`) → compute risk from forecast + soil + stage → update state → render cards, lifecycle, irrigation panel, tips.
- **Dual irrigation paths:** Rule-based always available; LLM path optional with fallback so the product works without Gemini.
- **Context-aware chat:** ChatWidget sends current session (crop, district, soil, yield, risk, irrigation) as context so Gemini can give relevant, personalized advice.
- **Persistence:** Prediction history stored in Supabase per user; model persisted as pickle; optional retrain via `/train` for dataset updates.

### 3.4 Deliverables

- Working **Flask ML API** with predict, irrigation, train, and Gemini endpoints.
- **React Dashboard** with control panel, yield/risk/irrigation cards, crop lifecycle, map picker, prediction history, and PDF export.
- **ChatWidget** with Gemini integration and context passing.
- **Documentation:** README (setup, env, API), PROJECT_SUMMARY_AND_VIVA.md, INTERNSHIP_REPORT.md (this document).

---

*This report can be used as-is for internship submission or adapted with your company name, duration, and specific role (e.g. ML intern, full-stack intern).*
