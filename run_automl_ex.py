from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from app.automl.pipeline import Pipeline
from app.automl.model_search import AutoML
from app.automl.explainability import shap_explain, lime_explain
from app.automl.mlops import save_model

# Load data
data = load_iris()
X, y = data.data, data.target

print("Starting AutoML pipeline...")

# 1. Build pipeline with caching
pipeline = Pipeline()
pipeline.add_step("preprocess", lambda x: x, cache=True)
pipeline.add_step("feature_engineer", lambda x: x, cache=True)

print("Running pipeline...")
results = pipeline.run(X)
X_processed = results["feature_engineer"]

print(f"Data shape after pipeline: {X_processed.shape}")

# 2. Run AutoML search
print("Starting hyperparameter optimization...")
param_space = {
    "n_estimators": [10, 50, 100],
    "max_depth": {"type": "int", "low": 2, "high": 10}
}

automl = AutoML(RandomForestClassifier, param_space)
best_model, best_params = automl.run(X_processed, y)

print("Best hyperparameters found:", best_params)

# 3. Explain with SHAP
print("Generating SHAP explanations...")
try:
    shap_vals, base_vals = shap_explain(best_model, X_processed)
    print("SHAP values shape:", shap_vals.shape)
    print("Base values shape:", base_vals.shape)
except Exception as e:
    print(f"SHAP explanation failed: {e}")

# 4. Explain with LIME
print("Generating LIME explanations...")
try:
    feature_names = data.feature_names
    class_names = data.target_names.tolist()
    lime_explanation = lime_explain(best_model, X_processed, feature_names, class_names)
    print("LIME explanation for first instance:", lime_explanation[:3])  # Show first 3 features
except Exception as e:
    print(f"LIME explanation failed: {e}")

# 5. Save model
model_path = save_model(best_model, "rf_classifier")
print("Model saved to:", model_path)

print("AutoML pipeline completed successfully!")

