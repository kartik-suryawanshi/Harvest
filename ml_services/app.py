from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from integrated_crop_prediction_training import EnhancedCropCyclePredictionModel
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math
import google.generativeai as genai
import json
from services.residue_logic import get_residue_recommendation
from disease_routes import disease_bp

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed. Using system environment variables only.")

app = Flask(__name__)
CORS(app)
app.register_blueprint(disease_bp)

MODEL_PATH = os.environ.get('AGRI_MODEL_PATH', 'agri_forecasting_model.pkl')
DATASET_PATH = os.environ.get('AGRI_DATASET_PATH', 'D:/Hackathons/Vortexa/HarvestIQ/ml_services/large_agri_dataset.csv')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Load the trained model at server start (with fallback to train if missing)
model = EnhancedCropCyclePredictionModel.load_model(MODEL_PATH)
if model is None and os.path.exists(DATASET_PATH):
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        model = EnhancedCropCyclePredictionModel()
        model.train_models(df)
        model.save_model(MODEL_PATH)
    except Exception as e:
        print(f"Failed to train model on startup: {e}")
        model = None

# Configure Gemini AI (use a supported v1beta model)
DEFAULT_GEMINI_MODEL = 'models/gemini-flash-latest'
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        gemini_model = genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
    except Exception:
        gemini_model = None
else:
    gemini_model = None

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 503

        data = request.get_json(force=True)
        # print("/predict request:", data)
        crop = data['crop_type']
        avg_temp = float(data['avg_temp'])
        tmax = float(data['tmax'])
        tmin = float(data['tmin'])
        sowing_date = data.get('sowing_date')  # Optional

        prediction = model.predict_with_current_date(crop, avg_temp, tmax, tmin, sowing_date)
        
        # The model should naturally output the yield without artificial post-processing caps
        # Removed hardcoded REALISTIC_MAX dampening and 0.85 scaling mechanism
        try:
            # Simply assure values are appropriately rounded for UI delivery
            p_yield = prediction.get('prediction', {}).get('yield_t_ha', 0)
            
            if 'prediction' in prediction:
                prediction['prediction']['yield_t_ha'] = round(p_yield, 2)
                if 'ci_lower' in prediction['prediction']:
                    prediction['prediction']['ci_lower'] = round(prediction['prediction']['ci_lower'], 2)
                if 'ci_upper' in prediction['prediction']:
                    prediction['prediction']['ci_upper'] = round(prediction['prediction']['ci_upper'], 2)
        except Exception as e:
            print(f"Error handling prediction floats: {e}")

        # print("/predict response:", prediction)
        return jsonify(prediction)
    except KeyError as ke:
        return jsonify({"error": f"Missing field: {str(ke)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Optional: endpoint to retrain and refresh the model
@app.route("/train", methods=["POST"])
def train():
    try:
        payload = request.get_json(silent=True) or {}
        print("/train request:", payload)
        dataset_path = payload.get('dataset_path', DATASET_PATH)
        import pandas as pd
        df = pd.read_csv(dataset_path)
        new_model = EnhancedCropCyclePredictionModel()
        new_model.train_models(df)
        new_model.save_model(MODEL_PATH)
        global model
        model = new_model
        # print("/train response: trained with metrics:", new_model.metrics)
        return jsonify({"status": "trained", "metrics": new_model.metrics})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


def _rule_based_irrigation_schedule(
    crop: str,
    sowing_date: str,
    weekly_forecast: List[Dict[str, Any]],
    crop_cycle: Dict[str, Any] | None,
    soil: Dict[str, Any] | None,
) -> Dict[str, Any]:
    """Generate a pragmatic irrigation schedule using simple heuristics.

    Returns a dict containing irrigation_schedule (list) and water_savings (int percentage).
    """
    # Parse sowing date
    try:
        start_date = datetime.strptime(sowing_date, "%Y-%m-%d")
    except Exception:
        start_date = datetime.utcnow()

    # Prepare 7-day series for temps/rain (used to estimate each 14-day window)
    temps7: List[float] = []
    rains7: List[float] = []
    if weekly_forecast:
        for d in weekly_forecast:
            try:
                t = float(d.get("temp", 0) or 0)
            except Exception:
                t = 0.0
            try:
                r = float(d.get("rain", 0) or 0)
            except Exception:
                r = 0.0
            if not math.isnan(t):
                temps7.append(t)
            if not math.isnan(r):
                rains7.append(r)
        if not temps7:
            temps7 = [0.0]
        if not rains7:
            rains7 = [0.0]

    # Basic crop-stage mapping if crop_cycle provided
    stages = []
    if crop_cycle and isinstance(crop_cycle, dict):
        growth_stages = crop_cycle.get("crop_cycle", {}).get("growth_stages") or crop_cycle.get("growth_stages")
        if isinstance(growth_stages, dict):
            # growth_stages may be dict keyed by stage index
            for k in sorted(growth_stages.keys(), key=lambda x: int(x) if str(x).isdigit() else 0):
                stages.append(growth_stages[k])
        elif isinstance(growth_stages, list):
            stages = growth_stages

    # Soil adjustments
    soil_type = (soil or {}).get("type", "").lower()
    drainage = (soil or {}).get("drainage", "").lower()
    soil_factor = 1.0
    if "clay" in soil_type:
        soil_factor -= 0.1  # holds water longer
    if "sandy" in soil_type:
        soil_factor += 0.15 # drains fast
    if drainage == "poor":
        soil_factor -= 0.1
    elif drainage == "good":
        soil_factor += 0.05

    # Heuristic schedule across 8 weeks from sowing
    schedule: List[Dict[str, Any]] = []
    for i in range(4):
        # each entry covers 2 weeks
        window_start = start_date + timedelta(days=i*14)
        window_end = window_start + timedelta(days=13)
        # Estimate per-window temperature and rainfall using rolling 14-day sequence
        # Repeat the 7-day pattern forward starting at offset i*14
        rain_est_mm = 0.0
        avg_temp_window = None
        if temps7 and rains7:
            total_t = 0.0
            for d_off in range(14):
                idx = (i*14 + d_off) % len(temps7)
                total_t += temps7[idx]
                rain_est_mm += rains7[(i*14 + d_off) % len(rains7)]
            avg_temp_window = total_t / 14.0

        # Base irrigation mm for two-week window depending on crop
        crop_lc = (crop or "").lower()
        if "rice" in crop_lc:
            base_mm = 120
        elif "wheat" in crop_lc:
            base_mm = 80
        elif "maize" in crop_lc or "corn" in crop_lc:
            base_mm = 100
        elif "sugarcane" in crop_lc:
            base_mm = 180
        else:
            base_mm = 90

        # Stage-based factor using crop_cycle dates when available
        stage_factor = 1.0
        try:
            if stages:
                # If any stage falls into this window, adjust according to BBCH
                for st in stages:
                    # Prefer predicted_date if present; else fallback to days_from_sowing
                    st_date = None
                    if st.get("predicted_date"):
                        try:
                            st_date = datetime.strptime(st["predicted_date"], "%Y-%m-%d")
                        except Exception:
                            st_date = None
                    if st_date is None and isinstance(st.get("days_from_sowing"), (int, float)):
                        st_date = start_date + timedelta(days=int(st["days_from_sowing"]))
                    if st_date and window_start <= st_date <= window_end:
                        bbch = int(st.get("bbch_code", 0))
                        if bbch in (5, 6, 7):      # heading/flowering/grain fill critical
                            stage_factor = max(stage_factor, 1.30)
                        elif bbch in (1, 2, 3):    # tillering/vegetative
                            stage_factor = max(stage_factor, 1.15)
                        else:
                            stage_factor = max(stage_factor, 1.05)
        except Exception:
            stage_factor = 1.0

        # Temperature adjustment (per window)
        if avg_temp_window is not None:
            if avg_temp_window >= 34:
                base_mm *= 1.2
            elif avg_temp_window <= 22:
                base_mm *= 0.9

        # Soil factor
        base_mm *= soil_factor

        # Apply stage factor
        base_mm *= stage_factor

        # Rain offset: subtract 60% of expected rain for this window
        req_mm = max(0, base_mm - 0.6 * rain_est_mm)

        # Map to action
        if req_mm < 25:
            action = "Skip"
            amount = None
            reason = "Natural rainfall sufficient"
        else:
            action = "Irrigate"
            # Split into two applications ~half each
            amount = str(int(round(req_mm / 2.0)))
            # Stage-aware reason
            reason = "Supplemental irrigation"
            if i == 1:
                reason = "Tillering/vegetative support"
            if i == 2:
                reason = "Flowering critical period"

        schedule.append({
            "week": f"Week {i*2+1}-{i*2+2}",
            "action": action,
            **({"amount": amount} if amount is not None else {}),
            "reason": reason,
        })

    # Estimate water savings vs fixed schedule of 120 mm per 2 weeks
    fixed_total = 4 * 120
    actual_total = sum(int(s.get("amount", 0)) for s in schedule if s.get("action") == "Irrigate")
    savings = int(round((fixed_total - actual_total) / fixed_total * 100)) if fixed_total else 0
    savings = max(-100, min(100, savings))

    return {"irrigation_schedule": schedule, "water_savings": savings}


@app.route("/irrigation", methods=["POST"])
def irrigation():
    try:
        data = request.get_json(force=True) or {}
        crop = data.get("crop_type") or data.get("crop")
        sowing_date = data.get("sowing_date") or datetime.utcnow().strftime("%Y-%m-%d")
        weekly_forecast = data.get("weekly_forecast") or []
        crop_cycle = data.get("crop_cycle") or {}
        soil = data.get("soil_profile") or {}

        # For robustness in hackathon setting, use rule-based by default.
        result = _rule_based_irrigation_schedule(crop, sowing_date, weekly_forecast, crop_cycle, soil)

        return jsonify({
            "crop_type": crop,
            "sowing_date": sowing_date,
            "irrigation_schedule": result["irrigation_schedule"],
            "water_savings": result["water_savings"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/irrigation/llm", methods=["POST"])
def irrigation_llm():
    """Generate irrigation schedule using Gemini in strict JSON format.

    Request JSON:
      {
        "crop_type": "Rice",
        "sowing_date": "2025-07-01",
        "weekly_forecast": [{"day":"Mon","temp":29,"rain":6,"humidity":78}, ...],
        "crop_cycle": { ... },
        "soil_profile": { "type":"Clay", "ph":6.5, "organicMatterPct":1.5, "drainage":"moderate" }
      }

    Response JSON:
      {
        "irrigation_schedule": [ {"week":"Week 1-2","action":"Irrigate","amount":"50","reason":"..."}, ... ],
        "notes": "Short rationale and assumptions"
      }
    """
    try:
        data = request.get_json(force=True) or {}
        crop = data.get("crop_type") or data.get("crop") or ""
        sowing_date = data.get("sowing_date") or datetime.utcnow().strftime("%Y-%m-%d")
        weekly_forecast = data.get("weekly_forecast") or []
        crop_cycle = data.get("crop_cycle") or {}
        soil = data.get("soil_profile") or {}

        if not gemini_model or not (GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")):
            # Fallback to rule-based if Gemini not configured
            result = _rule_based_irrigation_schedule(crop, sowing_date, weekly_forecast, crop_cycle, soil)
            return jsonify({
                "irrigation_schedule": result["irrigation_schedule"],
                "notes": "Fallback to rule-based schedule (Gemini not configured)",
            })

        # Build compact prompt with strict JSON instruction
        def truncate(obj, limit=2000):
            try:
                s = json.dumps(obj)[:limit]
                return s
            except Exception:
                return str(obj)[:limit]

        prompt = (
            "You are an agronomy expert. Create a dynamic two-week-window irrigation schedule (covering 8 weeks) "
            "for the given crop, SPECIFICALLY ADAPTING to the provided weather forecast and soil conditions. Output STRICT JSON only, no prose.\n"
            "Schema: {\n  \"irrigation_schedule\": [ { \"week\": \"Week 1-2\", \"action\": \"Irrigate|Skip\", \"amount\": \"<mm>\" (omit if Skip), \"reason\": \"<short reason citing specific weather/stage>\" } ],\n  \"notes\": \"short rationale and assumptions\"\n}.\n"
            f"Crop: {crop}\nSowing date: {sowing_date}\n"
            f"Soil: {truncate(soil)}\n"
            f"Weekly forecast (sample): {truncate(weekly_forecast)}\n"
            f"Crop cycle: {truncate(crop_cycle)}\n"
            "Rules: Use mm units. Prefer two applications when action is Irrigate. \n"
            "CRITICAL: If rain is predicted, REDUCE irrigation amount. If hot (>30C), INCREASE amount. \n"
            "Explain WHY in the 'reason' field (e.g., 'High temp forecast requires extra water', 'Rain expected, skipping')."
        )

        response = gemini_model.generate_content(prompt)
        text = (response.text or "").strip()

        # Attempt to extract JSON from response
        parsed = None
        try:
            # If fenced with ```json ... ```
            if "```" in text:
                chunk = text.split("```", 2)[1]
                if chunk.lower().startswith("json\n"):
                    chunk = chunk[5:]
                parsed = json.loads(chunk)
            else:
                # Try direct JSON
                parsed = json.loads(text)
        except Exception:
            # Heuristic: find first { ... } block
            try:
                start = text.find("{")
                end = text.rfind("}") + 1
                if start >= 0 and end > start:
                    parsed = json.loads(text[start:end])
            except Exception:
                parsed = None

        if not parsed or not isinstance(parsed, dict):
            # Fallback on parse failure
            result = _rule_based_irrigation_schedule(crop, sowing_date, weekly_forecast, crop_cycle, soil)
            return jsonify({
                "irrigation_schedule": result["irrigation_schedule"],
                "notes": "Fallback to rule-based schedule (Gemini output could not be parsed)",
            })

        schedule = parsed.get("irrigation_schedule") or []
        notes = parsed.get("notes") or "AI generated schedule"

        # Basic normalization
        norm_schedule = []
        for item in schedule:
            if not isinstance(item, dict):
                continue
            week = item.get("week") or ""
            action = item.get("action") or "Skip"
            amount = item.get("amount")
            reason = item.get("reason") or ""
            rec: Dict[str, Any] = {"week": str(week), "action": str(action), "reason": str(reason)}
            if amount is not None and str(amount).strip() != "":
                rec["amount"] = str(amount)
            norm_schedule.append(rec)

        return jsonify({
            "irrigation_schedule": norm_schedule,
            "notes": notes,
        })
    except Exception as e:
        print("/irrigation/llm error:", e)
        return jsonify({"error": str(e)}), 400


@app.route("/residue/recommendation", methods=["POST"])
def residue_recommendation():
    try:
        data = request.get_json(force=True) or {}
        crop = str(data.get("crop", ""))
        condition = str(data.get("condition", ""))
        livestock = data.get("livestock", False)
        goal = str(data.get("goal", ""))
        lang = str(data.get("lang", "en"))

        result = get_residue_recommendation(crop, condition, livestock, goal, lang=lang, model=gemini_model)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route("/gemini", methods=["POST"])
def gemini_chat():
    """Gemini AI endpoint for agricultural advice"""
    try:
        data = request.get_json(force=True) or {}
        prompt = data.get('prompt', '')
        api_key = data.get('apiKey', GEMINI_API_KEY)
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        # If no API key provided, return fallback response
        if not api_key or not gemini_model:
            return jsonify({
                "response": "Gemini AI is not configured. Please set GEMINI_API_KEY environment variable or provide API key.",
                "suggestions": [
                    "What crops should I grow in my soil?",
                    "How to improve irrigation efficiency?",
                    "What are the best farming practices?",
                    "How to increase crop yield?"
                ],
                "relatedQuestions": [
                    "How to prepare soil for planting?",
                    "What fertilizers should I use?",
                    "How to manage pests and diseases?"
                ]
            })
        
        # Configure Gemini with provided API key if different
        if api_key != GEMINI_API_KEY:
            genai.configure(api_key=api_key)
            temp_model = genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
        else:
            temp_model = gemini_model or genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
        
        # Generate response using Gemini
        response = temp_model.generate_content(prompt)
        
        # Extract suggestions and related questions from response
        response_text = response.text if response.text else "I couldn't generate a response at this time."
        
        # Generate contextual suggestions dynamically based on the response
        try:
            suggest_prompt = f"Based on this agricultural response: '{response_text[:500]}...', provide exactly 3 short follow-up questions the user might ask. Format as JSON array of strings."
            suggest_response = temp_model.generate_content(suggest_prompt)
            raw_sug = suggest_response.text.strip('```json').strip('```').strip()
            suggestions = json.loads(raw_sug)
            if not isinstance(suggestions, list):
                suggestions = ["What crops should I grow?", "How to improve soil health?", "Best irrigation methods?"]
                
             # Generate related topics
            related_prompt = f"Based on this agricultural topic: '{response_text[:500]}...', provide exactly 3 related broad topics they should research. Format AS JSON array of strings."
            related_response = temp_model.generate_content(related_prompt)
            raw_rel = related_response.text.strip('```json').strip('```').strip()
            related_questions = json.loads(raw_rel)
            if not isinstance(related_questions, list):
                related_questions = ["Soil Preparation", "Fertilizer Use", "Pest Management"]
        except Exception as dynamicError:
            print(f"Failed dynamic suggestions generation: {dynamicError}")
            suggestions = ["What crops should I grow?", "How to improve soil health?", "Best irrigation methods?"]
            related_questions = ["Soil Preparation", "Fertilizer Use", "Pest Management"]
        
        return jsonify({
            "response": response_text,
            "suggestions": suggestions,
            "relatedQuestions": related_questions
        })
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        return jsonify({
            "error": "Service Unavailable",
            "message": f"Sorry, I encountered an error: {str(e)}. Please try again."
        }), 503


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)