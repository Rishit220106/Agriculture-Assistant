from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from utils import load_class_names
from PIL import Image
import io

# -----------------------------
# App initialization
# -----------------------------
app = FastAPI(title="Disease Detection API")

# -----------------------------
# CORS configuration (REQUIRED for Lovable / Browser access)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all origins (safe for academic demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load model and metadata ONCE
# -----------------------------
MODEL_PATH = "models/best_model.h5"
CLASS_NAMES_PATH = "models/class_names.json"

model = tf.keras.models.load_model(MODEL_PATH)
class_names = load_class_names(CLASS_NAMES_PATH)

IMG_HEIGHT = model.input_shape[1]
IMG_WIDTH = model.input_shape[2]

# -----------------------------
# Image preprocessing function
# -----------------------------
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((IMG_WIDTH, IMG_HEIGHT))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_array = preprocess_image(image_bytes)

    prediction = model.predict(image_array)
    predicted_class = int(np.argmax(prediction, axis=1)[0])
    confidence = float(np.max(prediction) * 100)

    return {
        "predicted_disease": class_names[predicted_class],
        "confidence": round(confidence, 2)
    }
