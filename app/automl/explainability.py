import shap
import lime
import lime.lime_tabular

def shap_explain(model, X):
    """
    Generate SHAP values and base values for the given model and data.
    """
    # Use model.predict or model.predict_proba depending on model type
    # Here we explain predictions for classification probability of class 1
    explainer = shap.Explainer(model.predict, X)
    shap_values = explainer(X)
    return shap_values.values, shap_values.base_values

def lime_explain(model, X, feature_names=None, class_names=None, num_features=10):
    """
    Generate LIME explanation for the first instance in X.
    """
    try:
        explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=X, 
            feature_names=feature_names, 
            class_names=class_names, 
            mode="classification"
        )
        exp = explainer.explain_instance(
            X[0], 
            model.predict_proba, 
            num_features=num_features
        )
        return exp.as_list()
    except Exception as e:
        print(f"LIME explanation error: {e}")
        return None
