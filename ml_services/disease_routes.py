from flask import Blueprint, request, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np
import pandas as pd
import os
import json

disease_bp = Blueprint('disease_bp', __name__)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'disease_model', 'crop_disease_model.h5')
LABELS_PATH = os.path.join(BASE_DIR, 'disease_model', 'class_labels.json')
TREATMENTS_PATH = os.path.join(BASE_DIR, 'crop_disease_treatments.csv')

# Globals to store model and metadata
model = None
class_labels = None
treatments_df = None

def load_disease_resources():
    global model, class_labels, treatments_df
    
    # 1. Load Model
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print("Disease model loaded successfully.")
        except Exception as e:
            print(f"Error loading disease model: {e}")
    else:
        print(f"Disease model not found at {MODEL_PATH}. Prediction will return mock data.")

    # 2. Load Class Labels
    if os.path.exists(LABELS_PATH):
        try:
            with open(LABELS_PATH, 'r') as f:
                class_labels = json.load(f)
            # Ensure keys are integers if they are stored as strings
            class_labels = {int(k): v for k, v in class_labels.items()}
            print("Class labels loaded.")
        except Exception as e:
            print(f"Error loading class labels: {e}")

    # 3. Load Treatments CSV
    if os.path.exists(TREATMENTS_PATH):
        try:
            treatments_df = pd.read_csv(TREATMENTS_PATH)
            print("Crop disease treatments loaded.")
        except Exception as e:
            print(f"Error loading treatments: {e}")

# Initial resource load
load_disease_resources()

def preprocess_image(image_file):
    img = Image.open(image_file).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@disease_bp.route('/disease-predict', methods=['POST'])
def predict_disease():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image_file = request.files['image']
    crop_name = request.form.get('crop_name', 'Unknown')
    
    # 1. Prediction Logic (Model Inference or Mock)
    try:
        if model and class_labels:
            processed_img = preprocess_image(image_file)
            predictions = model.predict(processed_img)
            class_idx = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]) * 100)
            
            # Map index to class label from model metadata
            predicted_class = class_labels.get(class_idx, "Unknown")
        else:
            return jsonify({"error": "Disease detection model is not yet trained or loaded. Please complete training first."}), 503

        # 2. Extract disease name from class (strip crop prefix if exists)
        # Expecting labels like "Wheat___Leaf_rust"
        if "___" in predicted_class:
            disease_name = predicted_class.split("___")[-1].replace("_", " ")
        else:
            disease_name = predicted_class

        # 3. Lookup Treatment Information
        result = {
            "disease": disease_name,
            "confidence": round(confidence, 2),
            "crop": crop_name,
            "treatment": "Maintain good field hygiene.",
            "fertilizer": "Balanced NPK",
            "severity": "Medium",
            "healthy": "Healthy" in disease_name
        }

        if treatments_df is not None:
            # Filter by crop and disease
            match = treatments_df[
                (treatments_df['Crop'].str.lower() == crop_name.lower()) & 
                (treatments_df['Disease'].str.lower().str.contains(disease_name.lower()))
            ]
            
            if not match.empty:
                row = match.iloc[0]
                result["treatment"] = row['Recommended_Treatment']
                result["fertilizer"] = row['Fertilizer']
                result["severity"] = row['Severity']
                result["healthy"] = bool(row['Healthy'])

        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

@disease_bp.route('/disease-model-status', methods=['GET'])
def model_status():
    return jsonify({
        "model_loaded": model is not None,
        "labels_loaded": class_labels is not None,
        "treatments_loaded": treatments_df is not None
    })
