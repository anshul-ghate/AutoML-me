from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
import io, os, joblib, json
from typing import List

router = APIRouter(prefix="/api/export", tags=["export"])

# 1) Export trained model artifact
@router.get("/model/{session_id}")
async def export_model(session_id: str):
    model_path = f"models/{session_id}_best_model.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model artifact not found")
    return FileResponse(model_path, filename=os.path.basename(model_path))

# 2) Evaluate additional metrics: ROC‐AUC, confusion matrix
@router.get("/evaluate/{session_id}")
async def evaluate_model(session_id: str):
    results_path = f"models/{session_id}_metrics.json"
    if not os.path.exists(results_path):
        raise HTTPException(status_code=404, detail="Evaluation metrics not found")
    with open(results_path) as f:
        metrics = json.load(f)
    return JSONResponse(metrics)

# 3) Predict endpoint
class PredictRequest(BaseModel):
    session_id: str
    features: dict

@router.post("/predict")
async def predict(req: PredictRequest):
    model_path = f"models/{req.session_id}_best_model.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model not loaded")
    model = joblib.load(model_path)
    df = pd.DataFrame([req.features])
    try:
        preds = model.predict(df.values)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")
    return {"predictions": preds.tolist()}
