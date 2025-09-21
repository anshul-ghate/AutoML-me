from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.automl.pipeline import Pipeline
from app.automl.model_search import ModelSearch
from app.automl.explainability import generate_shap_explanation
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier

from app.auth.jwt_auth import JWTBearer

router = APIRouter(prefix="/automl", tags=["automl"])

class AutoMLRequest(BaseModel):
    n_estimators: list[int] = Field([10, 20], description="Grid search values for n_estimators")
    max_depth: list[int | None] = Field([3, None], description="Grid search values for max_depth")

class AutoMLResponse(BaseModel):
    best_params: Dict[str, Any]
    shap_values_shape: tuple[int, ...]
    base_values: list[float]

@router.post("/run", response_model=AutoMLResponse, dependencies=[Depends(JWTBearer())])
async def run_automl(request: AutoMLRequest):
    try:
        # Load sample data
        data = load_iris()
        X, y = data.data, data.target

        # Define identity steps
        def preprocess(data): return data
        def feature_engineer(data): return data

        # Build pipeline
        pipeline = Pipeline()
        pipeline.add_step("preprocessing", preprocess)
        pipeline.add_step("feature_engineering", feature_engineer)
        X_processed = pipeline.run(X)["feature_engineering"]

        # Model search
        estimator = RandomForestClassifier(random_state=42)
        param_grid = {
            "n_estimators": request.n_estimators,
            "max_depth": request.max_depth
        }
        search = ModelSearch(estimator, param_grid)
        best_model, best_params = search.search(X_processed, y)

        # Explainability
        shap_vals, base_vals = generate_shap_explanation(best_model, X_processed)

        return AutoMLResponse(
            best_params=best_params,
            shap_values_shape=shap_vals.shape,
            base_values=base_vals.tolist() if hasattr(base_vals, "tolist") else list(base_vals)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
