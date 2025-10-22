"""
api_monitoring_explainability.py - REST API for Drift & XAI
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.model_monitoring import get_drift_monitor
from app.services.explainability_service import get_explainer
import pandas as pd
import io
from pydantic import BaseModel
from typing import List

router = APIRouter()

class DriftRequest(BaseModel):
    session_id: str

@router.post("/monitoring/drift/set-baseline")
async def set_drift_baseline(session_id: str, file: UploadFile = File(...)):
    """Set reference data for drift detection"""
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    monitor = get_drift_monitor()
    monitor.set_reference_data(session_id, df)
    return {"status": "success", "message": f"Baseline set for session {session_id}"}

@router.post("/monitoring/drift/detect")
async def detect_drift(session_id: str, file: UploadFile = File(...)):
    """Detect drift in current data vs baseline"""
    content = await file.read()
    current_df = pd.read_csv(io.BytesIO(content))
    monitor = get_drift_monitor()
    result = monitor.detect_drift(session_id, current_df)
    return result

@router.get("/explainability/shap/{session_id}")
async def get_shap_explanation(session_id: str):
    """Get SHAP feature importance"""
    explainer = get_explainer()
    importance = explainer.get_feature_importance(session_id)
    if not importance:
        raise HTTPException(404, "Model not found or no feature importance available")
    return {"feature_importance": importance}

@router.post("/explainability/lime")
async def explain_lime(session_id: str, instance: List[float]):
    """LIME explanation for single prediction"""
    import numpy as np
    explainer = get_explainer()
    result = explainer.explain_lime(session_id, np.array(instance))
    return result
