from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from app.automl.pipeline import Pipeline
from app.automl.model_search import AutoML
from app.automl.explainability import shap_explain, lime_explain
from app.automl.mlops import save_model

# 1. Build and run the pipeline
pipeline = Pipeline()
pipeline.add_step("preprocess", lambda x: x, cache=True)
pipeline.add_step("features", lambda x: x, cache=True)
X, y = load_iris(return_X_y=True)
X_processed = pipeline.run(X)["features"]

# 2. Define hyperparameter space and run AutoML
param_space = {
    "n_estimators": [10, 50, 100],
    "max_depth": {"type": "int", "low": 2, "high": 10}
}
automl = AutoML(RandomForestClassifier, param_space)
best_model, best_params = automl.run(X_processed, y)
print("Best hyperparameters:", best_params)

# 3. Generate explanations
shap_vals, base_vals = shap_explain(best_model, X_processed)
print("SHAP values shape:", shap_vals.shape)
lime_explanation = lime_explain(
    best_model, 
    X_processed, 
    feature_names=load_iris().feature_names,
    class_names=load_iris().target_names.tolist()
)
print("LIME explanation for first instance:", lime_explanation)

# 4. Save the trained model
model_path = save_model(best_model, "rf_classifier")
print("Model saved at:", model_path)
