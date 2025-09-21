import joblib
import os
from datetime import datetime

MODEL_REGISTRY = os.getenv("MODEL_REGISTRY_PATH", "models/")

def save_model(model, name: str):
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    path = os.path.join(MODEL_REGISTRY, f"{name}_{timestamp}.pkl")
    os.makedirs(MODEL_REGISTRY, exist_ok=True)
    joblib.dump(model, path)
    return path

def load_model(path: str):
    return joblib.load(path)
