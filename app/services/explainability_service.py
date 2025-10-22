"""
explainability_service.py - Production SHAP & LIME Explainability (Simplified)
"""
import shap
import lime
import lime.lime_tabular
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from loguru import logger

class ModelExplainer:
    def __init__(self):
        self.explainers = {}
        self.models = {}
    
    def register_model(self, session_id: str, model, X_train: pd.DataFrame):
        """Register model and create explainers"""
        try:
            self.models[session_id] = model
            
            # SHAP explainer
            try:
                # For tree-based models
                if hasattr(model, 'tree_'):
                    self.explainers[f"{session_id}_shap"] = shap.TreeExplainer(model)
                else:
                    # For other models, use Explainer (auto-detects type)
                    self.explainers[f"{session_id}_shap"] = shap.Explainer(model, X_train)
            except Exception as e:
                logger.warning(f"SHAP explainer creation failed: {e}")
                self.explainers[f"{session_id}_shap"] = None
            
            # LIME explainer
            try:
                self.explainers[f"{session_id}_lime"] = lime.lime_tabular.LimeTabularExplainer(
                    X_train.values,
                    feature_names=X_train.columns.tolist(),
                    mode='classification' if hasattr(model, 'predict_proba') else 'regression'
                )
            except Exception as e:
                logger.warning(f"LIME explainer creation failed: {e}")
                self.explainers[f"{session_id}_lime"] = None
                
        except Exception as e:
            logger.error(f"Model registration failed: {e}")
    
    def explain_shap(self, session_id: str, X_test: pd.DataFrame) -> Dict[str, Any]:
        """Generate SHAP explanations"""
        explainer_key = f"{session_id}_shap"
        if explainer_key not in self.explainers or self.explainers[explainer_key] is None:
            return {"error": "SHAP explainer not available"}
        
        try:
            explainer = self.explainers[explainer_key]
            shap_values = explainer(X_test[:100])  # Limit to 100 samples for performance
            
            # Extract values based on shap version
            if hasattr(shap_values, 'values'):
                values = shap_values.values
            else:
                values = shap_values
            
            # Handle multi-class
            if len(values.shape) == 3:
                values = values[:, :, 1]  # Take positive class
            
            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': X_test.columns,
                'importance': np.abs(values).mean(axis=0)
            }).sort_values('importance', ascending=False)
            
            return {
                "shap_values": values.tolist() if isinstance(values, np.ndarray) else [],
                "feature_importance": feature_importance.to_dict(orient='records'),
                "status": "success"
            }
        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")
            return {"error": str(e)}
    
    def explain_lime(self, session_id: str, instance: np.ndarray, num_features: int = 10) -> Dict[str, Any]:
        """Generate LIME explanation for single instance"""
        explainer_key = f"{session_id}_lime"
        model_key = session_id
        
        if explainer_key not in self.explainers or self.explainers[explainer_key] is None:
            return {"error": "LIME explainer not available"}
        
        if model_key not in self.models:
            return {"error": "Model not found"}
        
        try:
            explainer = self.explainers[explainer_key]
            model = self.models[model_key]
            
            predict_fn = model.predict_proba if hasattr(model, 'predict_proba') else model.predict
            
            explanation = explainer.explain_instance(
                instance, 
                predict_fn,
                num_features=num_features
            )
            
            return {
                "explanation": explanation.as_list(),
                "status": "success"
            }
        except Exception as e:
            logger.error(f"LIME explanation failed: {e}")
            return {"error": str(e)}
    
    def get_feature_importance(self, session_id: str) -> List[Dict[str, Any]]:
        """Get overall feature importance"""
        model = self.models.get(session_id)
        if model is None:
            return []
        
        try:
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
                feature_names = getattr(model, 'feature_names_in_', 
                                       [f'feature_{i}' for i in range(len(importances))])
                
                return [
                    {"feature": name, "importance": float(imp)}
                    for name, imp in sorted(zip(feature_names, importances), 
                                           key=lambda x: x[1], reverse=True)
                ]
            elif hasattr(model, 'coef_'):
                # For linear models
                coefficients = np.abs(model.coef_).flatten()
                feature_names = getattr(model, 'feature_names_in_', 
                                       [f'feature_{i}' for i in range(len(coefficients))])
                
                return [
                    {"feature": name, "importance": float(coef)}
                    for name, coef in sorted(zip(feature_names, coefficients), 
                                            key=lambda x: x[1], reverse=True)
                ]
        except Exception as e:
            logger.error(f"Feature importance extraction failed: {e}")
        
        return []

# Global instance
_explainer = None

def get_explainer() -> ModelExplainer:
    global _explainer
    if _explainer is None:
        _explainer = ModelExplainer()
    return _explainer
