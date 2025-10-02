from fastapi import APIRouter, UploadFile, File, HTTPException
from app.preprocessing.cleaning import clean_and_scale
from app.preprocessing.text import text_vectorize
from app.automl.model_search import AutoML
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import uvicorn
import json

router = APIRouter(prefix="/api/train", tags=["training"])

@router.post("/structured")
async def train_structured(file: UploadFile = File(...), params: dict = None):
    """Train on structured CSV data."""
    df = pd.read_csv(file.file)
    df = clean_and_scale(df)
    y = df.iloc[:, -1]
    X = df.iloc[:, :-1]
    automl = AutoML(RandomForestClassifier, params or {})
    model, best_params = automl.run(X, y)
    # Save model metadata
    return {"status": "success", "best_params": best_params}

@router.post("/text")
async def train_text(file: UploadFile = File(...), target_col: str = "label", params: dict = None):
    """Train on text CSV data."""
    df = pd.read_csv(file.file)
    X_raw = df['text'].tolist()
    y = df[target_col]
    X, vectorizer = text_vectorize(X_raw)
    automl = AutoML(RandomForestClassifier, params or {})
    model, best_params = automl.run(X.toarray(), y)
    return {"status": "success", "best_params": best_params}

# Include in main.py:
# app.include_router(router)
