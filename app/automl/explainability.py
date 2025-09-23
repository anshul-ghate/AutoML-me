import numpy as np
import shap
import lime
import lime.lime_tabular
from typing import Optional, Sequence, Tuple

def shap_explain(model, X: np.ndarray, max_background: int = 200) -> Tuple[np.ndarray, np.ndarray]:
    """
    Return (shap_values, base_values) for a fitted model and data.
    - Uses TreeExplainer for tree models; falls back to generic Explainer otherwise.
    - Caps background size for performance.
    """
    # Small, representative background for kernel-based explainers
    bg = X if len(X) <= max_background else shap.sample(X, max_background)
    try:
        # Prefer TreeExplainer for tree-based models (RandomForest, XGBoost, LightGBM)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer(X)
        return np.array(shap_values.values), np.array(shap_values.base_values)
    except Exception:
        # Generic model-agnostic path
        try:
            explainer = shap.Explainer(model, bg)
        except Exception:
            # Fallback: explain predicted probabilities if available, else predictions
            predict_fn = getattr(model, "predict_proba", getattr(model, "predict", None))
            if predict_fn is None:
                raise ValueError("Model must implement predict or predict_proba for SHAP.")
            explainer = shap.Explainer(predict_fn, bg)
        shap_values = explainer(X)
        # SHAP returns different shapes depending on explainer; normalize to arrays
        values = np.array(getattr(shap_values, "values", shap_values))
        base = np.array(getattr(shap_values, "base_values", 0.0))
        return values, base

def generate_shap_explanation(model, X: np.ndarray, max_background: int = 200) -> Tuple[np.ndarray, np.ndarray]:
    """
    Backward-compatible wrapper expected by API layer.
    """
    return shap_explain(model, X, max_background=max_background)

def lime_explain(
    model,
    X: np.ndarray,
    feature_names: Optional[Sequence[str]] = None,
    class_names: Optional[Sequence[str]] = None,
    num_features: int = 10,
    sample_size: int = 500,
):
    """
    Generate a single-instance LIME explanation.
    - Uses classification mode if predict_proba exists; else uses regression.
    - Subsamples training data for performance.
    """
    try:
        has_proba = hasattr(model, "predict_proba")
        mode = "classification" if has_proba else "regression"

        # Keep the explainer's training background small
        train_bg = X if len(X) <= sample_size else shap.sample(X, sample_size)
        explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=train_bg,
            feature_names=feature_names,
            class_names=class_names if mode == "classification" else None,
            mode=mode,
            discretize_continuous=True,
        )

        predict_fn = model.predict_proba if has_proba else model.predict
        exp = explainer.explain_instance(X[0], predict_fn, num_features=num_features)
        return exp.as_list()
    except Exception as e:
        print(f"LIME explanation error: {e}")
        return None

