from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from ..auth.jwt_handler import get_current_user
from ..automl.model_search import AutoML
from ..automl.explainability import shap_explain, lime_explain
from ..automl.mlops import save_model
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
import numpy as np

router = APIRouter(prefix="/automl", tags=["automl"])

class AutoMLRequest(BaseModel):
    n_estimators: Optional[List[int]] = [10, 50, 100]
    max_depth: Optional[List[int]] = [3, 5, 7, None]
    min_samples_split: Optional[List[int]] = [2, 5, 10]

class AutoMLResponse(BaseModel):
    best_params: Dict[str, Any]
    best_score: float
    shap_values_shape: List[int]
    base_values: List[float]
    lime_explanation: Optional[List[Any]]
    model_path: str

@router.post("/run", response_model=AutoMLResponse)
async def run_automl(
    request: AutoMLRequest = AutoMLRequest(),
    current_user: str = Depends(get_current_user)
):
    try:
        # Load sample data (in production, this would come from uploaded files)
        data = load_iris()
        X, y = data.data, data.target
        
        # Prepare parameter space
        param_space = {
            "n_estimators": request.n_estimators,
            "max_depth": request.max_depth,
            "min_samples_split": request.min_samples_split
        }
        
        # Run AutoML
        automl = AutoML(RandomForestClassifier, param_space)
        best_model, best_params = automl.run(X, y)
        
        # Get model score
        best_score = best_model.score(X, y)
        
        # Generate explanations
        try:
            shap_values, base_values = shap_explain(best_model, X[:10])  # Sample for demo
            shap_values_shape = list(shap_values.shape) if hasattr(shap_values, 'shape') else [0, 0]
            base_values_list = base_values.tolist() if hasattr(base_values, 'tolist') else [0.0]
        except Exception as e:
            print(f"SHAP explanation failed: {e}")
            shap_values_shape = [0, 0]
            base_values_list = [0.0]
        
        try:
            lime_explanation = lime_explain(best_model, X[:10], feature_names=data.feature_names)
        except Exception as e:
            print(f"LIME explanation failed: {e}")
            lime_explanation = None
        
        # Save model
        model_path = save_model(best_model, f"automl_model_{current_user}")
        
        return AutoMLResponse(
            best_params=best_params,
            best_score=best_score,
            shap_values_shape=shap_values_shape,
            base_values=base_values_list,
            lime_explanation=lime_explanation,
            model_path=model_path
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AutoML execution failed: {str(e)}")
