# app/training/advanced_trainer.py
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

class AdvancedModelTrainer:
    def __init__(self):
        self.models = {
            'random_forest': RandomForestClassifier(random_state=42),
            'gradient_boosting': GradientBoostingClassifier(random_state=42),
            'xgboost': XGBClassifier(random_state=42),
            'logistic_regression': LogisticRegression(random_state=42),
            'svm': SVC(random_state=42, probability=True)
        }
        self.experiment_tracker = ExperimentTracker()
        
    def train_multiple_models(self, X, y, cv_folds=5):
        """Train and compare multiple models"""
        results = {}
        
        for name, model in self.models.items():
            print(f"Training {name}...")
            
            # Cross-validation
            cv_scores = cross_val_score(model, X, y, cv=StratifiedKFold(n_splits=cv_folds), 
                                      scoring='accuracy')
            
            # Train final model
            model.fit(X, y)
            
            # Generate predictions for metrics
            y_pred = model.predict(X)
            
            # Calculate metrics
            metrics = {
                'cv_mean_accuracy': cv_scores.mean(),
                'cv_std_accuracy': cv_scores.std(),
                'train_accuracy': model.score(X, y)
            }
            
            # Log experiment
            run_id = self.experiment_tracker.log_experiment(
                model=model,
                params=model.get_params(),
                metrics=metrics,
                artifacts={
                    'classification_report': classification_report(y, y_pred, output_dict=True),
                    'feature_importance': self._get_feature_importance(model, X.columns if hasattr(X, 'columns') else None)
                }
            )
            
            results[name] = {
                'model': model,
                'metrics': metrics,
                'run_id': run_id
            }
            
        return results
        
    def _get_feature_importance(self, model, feature_names=None):
        """Extract feature importance if available"""
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
            if feature_names:
                return dict(zip(feature_names, importance.tolist()))
            return importance.tolist()
        return None
