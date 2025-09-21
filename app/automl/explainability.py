import shap
import lime
import lime.lime_tabular

def shap_explain(model, X):
    explainer = shap.Explainer(model, X)
    shap_values = explainer(X)
    return shap_values.values, shap_values.base_values

def lime_explain(model, X, feature_names=None, class_names=None, num_features=10):
    explainer = lime.lime_tabular.LimeTabularExplainer(
        training_data=X, feature_names=feature_names, class_names=class_names, mode="classification"
    )
    exp = explainer.explain_instance(X[0], model.predict_proba, num_features=num_features)
    return exp.as_list()

