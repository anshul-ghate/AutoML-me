import shap

def generate_shap_explanation(model, X):
    explainer = shap.Explainer(model)
    shap_values = explainer(X)
    # Return summary values; visualization can be handled on frontend
    return shap_values.values, shap_values.base_values
