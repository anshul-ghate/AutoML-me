# app/training/experiment_tracker.py
import mlflow
import mlflow.sklearn
from typing import Dict, Any
import json
import os

class ExperimentTracker:
    def __init__(self, experiment_name: str = "AutoML_Experiments"):
        mlflow.set_experiment(experiment_name)
        
    def log_experiment(self, model, params: Dict, metrics: Dict, artifacts: Dict = None):
        """Log experiment with MLflow"""
        with mlflow.start_run():
            # Log parameters
            mlflow.log_params(params)
            
            # Log metrics
            mlflow.log_metrics(metrics)
            
            # Log model
            mlflow.sklearn.log_model(model, "model")
            
            # Log artifacts
            if artifacts:
                for name, content in artifacts.items():
                    with open(f"{name}.json", "w") as f:
                        json.dump(content, f)
                    mlflow.log_artifact(f"{name}.json")
                    os.remove(f"{name}.json")
            
            return mlflow.active_run().info.run_id

