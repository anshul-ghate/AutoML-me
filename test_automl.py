from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from app.automl.pipeline import Pipeline
from app.automl.model_search import ModelSearch
from app.automl.explainability import generate_shap_explanation

# Load sample data
data = load_iris()
X, y = data.data, data.target

# Define simple preprocessing function (identity)
def preprocess(data):
    return data

# Define feature engineering function (identity)
def feature_engineer(data):
    return data

# Initialize pipeline
pipeline = Pipeline()
pipeline.add_step("preprocessing", preprocess)
pipeline.add_step("feature_engineering", feature_engineer)

# Run initial pipeline steps
results = pipeline.run(X)
X_processed = results["feature_engineering"]

# Define estimator and hyperparameter grid
estimator = RandomForestClassifier(random_state=42)
param_grid = {
    "n_estimators": [10, 20],
    "max_depth": [3, None]
}

# Perform model search
search = ModelSearch(estimator, param_grid)
best_model, best_params = search.search(X_processed, y)

print("Best Params:", best_params)

# Generate SHAP explanations
shap_values, base_values = generate_shap_explanation(best_model, X_processed)

print("SHAP values shape:", shap_values.shape)
print("Base values:", base_values)
