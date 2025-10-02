from sklearn.model_selection import cross_val_score, StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_curve
from sklearn.preprocessing import StandardScaler, LabelEncoder
import numpy as np
import pandas as pd
from .experiment_tracker import ExperimentTracker
import time

# Optional dependencies with graceful fallback
try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

try:
    from lightgbm import LGBMClassifier
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

class AdvancedModelTrainer:
    """Enterprise-grade model trainer with comprehensive algorithms and evaluation"""
    
    def __init__(self):
        self.models = self._initialize_models()
        self.experiment_tracker = ExperimentTracker()
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def _initialize_models(self):
        """Initialize all available models with optimized parameters"""
        models = {
            'random_forest': RandomForestClassifier(
                random_state=42, n_estimators=100, max_depth=10, 
                min_samples_split=5, min_samples_leaf=2, n_jobs=-1
            ),
            'extra_trees': ExtraTreesClassifier(
                random_state=42, n_estimators=100, max_depth=10,
                min_samples_split=5, min_samples_leaf=2, n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                random_state=42, n_estimators=100, max_depth=6,
                learning_rate=0.1, subsample=0.8
            ),
            'logistic_regression': LogisticRegression(
                random_state=42, max_iter=1000, C=1.0,
                solver='liblinear'
            ),
            'ridge_classifier': RidgeClassifier(
                random_state=42, alpha=1.0
            ),
            'svm_rbf': SVC(
                random_state=42, probability=True, C=1.0,
                gamma='scale', kernel='rbf'
            ),
            'svm_linear': SVC(
                random_state=42, probability=True, C=1.0,
                kernel='linear'
            ),
            'naive_bayes': GaussianNB(),
            'knn': KNeighborsClassifier(
                n_neighbors=5, weights='distance'
            )
        }
        
        # Add advanced boosting models if available
        if XGBOOST_AVAILABLE:
            models['xgboost'] = XGBClassifier(
                random_state=42, n_estimators=100, max_depth=6,
                learning_rate=0.1, subsample=0.8, colsample_bytree=0.8,
                objective='binary:logistic'
            )
            
        if LIGHTGBM_AVAILABLE:
            models['lightgbm'] = LGBMClassifier(
                random_state=42, n_estimators=100, max_depth=6,
                learning_rate=0.1, subsample=0.8, colsample_bytree=0.8,
                objective='binary', verbose=-1
            )
            
        return models
        
    def train_multiple_models(self, X, y, test_size=0.2, cv_folds=5):
        """Train and comprehensively evaluate multiple models"""
        results = {}
        
        # Prepare data
        X, y = self._prepare_data(X, y)
        
        # Train-test split for holdout evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"Training {len(self.models)} models on {X_train.shape[0]} samples with {X_train.shape[1]} features...")
        
        for name, model in self.models.items():
            print(f"\n🔄 Training {name.replace('_', ' ').title()}...")
            start_time = time.time()
            
            try:
                # Cross-validation on training set
                cv_scores = cross_val_score(
                    model, X_train, y_train,
                    cv=StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42),
                    scoring='accuracy', n_jobs=-1
                )
                
                # Train on full training set
                model.fit(X_train, y_train)
                
                # Predictions
                y_train_pred = model.predict(X_train)
                y_test_pred = model.predict(X_test)
                y_test_proba = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None
                
                # Comprehensive metrics
                metrics = self._calculate_comprehensive_metrics(
                    y_train, y_train_pred, y_test, y_test_pred, y_test_proba
                )
                
                # Add CV and timing metrics
                metrics.update({
                    'cv_mean_accuracy': float(cv_scores.mean()),
                    'cv_std_accuracy': float(cv_scores.std()),
                    'training_time_seconds': float(time.time() - start_time),
                    'cv_scores': [float(score) for score in cv_scores]
                })
                
                # Feature importance
                feature_importance = self._get_feature_importance(model, X_train.columns if hasattr(X_train, 'columns') else None)
                
                # Log experiment
                run_id = self._log_experiment_safely(model, metrics, feature_importance)
                
                results[name] = {
                    'model': model,
                    'metrics': metrics,
                    'feature_importance': feature_importance,
                    'run_id': run_id,
                    'status': 'success'
                }
                
                print(f"✅ {name}: CV Acc = {metrics['cv_mean_accuracy']:.4f} ± {metrics['cv_std_accuracy']:.4f}, "
                      f"Test Acc = {metrics['test_accuracy']:.4f}")
                
            except Exception as e:
                error_msg = str(e)
                print(f"❌ {name}: Training failed - {error_msg}")
                
                results[name] = {
                    'error': error_msg,
                    'metrics': self._get_default_metrics(),
                    'status': 'failed'
                }
                
        return results
    
    def _prepare_data(self, X, y):
        """Prepare and validate data for training"""
        # Convert to DataFrame if necessary
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)
            
        # Handle target variable
        if y.dtype == 'object':
            y = self.label_encoder.fit_transform(y)
            
        # Select only numeric columns
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            raise ValueError("No numeric features available for training")
            
        X = X[numeric_cols]
        
        # Handle missing values
        X = X.fillna(X.median())
        
        # Handle infinite values
        X = X.replace([np.inf, -np.inf], np.nan).fillna(X.median())
        
        # Scale features
        X_scaled = pd.DataFrame(
            self.scaler.fit_transform(X),
            columns=X.columns,
            index=X.index
        )
        
        return X_scaled, y
    
    def _calculate_comprehensive_metrics(self, y_train, y_train_pred, y_test, y_test_pred, y_test_proba=None):
        """Calculate comprehensive evaluation metrics"""
        from sklearn.metrics import (
            accuracy_score, precision_score, recall_score, f1_score,
            balanced_accuracy_score, matthews_corrcoef
        )
        
        metrics = {
            # Basic metrics
            'train_accuracy': float(accuracy_score(y_train, y_train_pred)),
            'test_accuracy': float(accuracy_score(y_test, y_test_pred)),
            
            # Precision, Recall, F1
            'test_precision': float(precision_score(y_test, y_test_pred, average='weighted', zero_division=0)),
            'test_recall': float(recall_score(y_test, y_test_pred, average='weighted', zero_division=0)),
            'test_f1': float(f1_score(y_test, y_test_pred, average='weighted', zero_division=0)),
            
            # Advanced metrics
            'balanced_accuracy': float(balanced_accuracy_score(y_test, y_test_pred)),
            'matthews_corrcoef': float(matthews_corrcoef(y_test, y_test_pred)),
        }
        
        # ROC-AUC for binary classification
        try:
            if len(np.unique(y_test)) == 2 and y_test_proba is not None:
                metrics['roc_auc'] = float(roc_auc_score(y_test, y_test_proba[:, 1]))
            elif y_test_proba is not None:
                metrics['roc_auc_ovr'] = float(roc_auc_score(y_test, y_test_proba, multi_class='ovr'))
        except Exception:
            metrics['roc_auc'] = 0.5
            
        return metrics
    
    def _get_feature_importance(self, model, feature_names=None):
        """Extract feature importance with multiple methods"""
        try:
            importance_data = {}
            
            # Tree-based models
            if hasattr(model, 'feature_importances_'):
                importance = model.feature_importances_
                importance_data['feature_importance'] = importance.tolist()
                
                if feature_names is not None:
                    importance_data['feature_importance_dict'] = dict(zip(feature_names, importance.tolist()))
                    # Top 10 most important features
                    importance_data['top_features'] = sorted(
                        zip(feature_names, importance.tolist()),
                        key=lambda x: x[1], reverse=True
                    )[:10]
            
            # Linear models
            elif hasattr(model, 'coef_'):
                coef = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
                importance = np.abs(coef)
                importance_data['coefficient_importance'] = importance.tolist()
                
                if feature_names is not None:
                    importance_data['coefficient_dict'] = dict(zip(feature_names, coef.tolist()))
                    importance_data['top_features'] = sorted(
                        zip(feature_names, importance.tolist()),
                        key=lambda x: x[1], reverse=True
                    )[:10]
            
            return importance_data
            
        except Exception as e:
            print(f"Error extracting feature importance: {e}")
            return {}
    
    def _log_experiment_safely(self, model, metrics, feature_importance):
        """Safely log experiment to MLflow"""
        try:
            return self.experiment_tracker.log_experiment(
                model=model,
                params=model.get_params(),
                metrics=metrics,
                artifacts={'feature_importance': feature_importance}
            )
        except Exception as e:
            print(f"Warning: Failed to log experiment to MLflow: {e}")
            return f"local_run_{hash(str(metrics)) % 10000}"
    
    def _get_default_metrics(self):
        """Get default metrics for failed models"""
        return {
            'cv_mean_accuracy': 0.0,
            'cv_std_accuracy': 0.0,
            'train_accuracy': 0.0,
            'test_accuracy': 0.0,
            'test_precision': 0.0,
            'test_recall': 0.0,
            'test_f1': 0.0,
            'balanced_accuracy': 0.0,
            'matthews_corrcoef': 0.0,
            'roc_auc': 0.5,
            'training_time_seconds': 0.0
        }
    
    def get_model_recommendations(self, results):
        """Get model recommendations based on results"""
        recommendations = []
        
        # Find best performing models
        successful_results = {k: v for k, v in results.items() if v.get('status') == 'success'}
        
        if successful_results:
            # Sort by test accuracy
            sorted_models = sorted(
                successful_results.items(),
                key=lambda x: x[1]['metrics']['test_accuracy'],
                reverse=True
            )
            
            best_model = sorted_models[0]
            recommendations.append(f"Best performing model: {best_model[0]} (Test Accuracy: {best_model[1]['metrics']['test_accuracy']:.4f})")
            
            # Check for overfitting
            for name, result in sorted_models[:3]:
                train_acc = result['metrics']['train_accuracy']
                test_acc = result['metrics']['test_accuracy']
                gap = train_acc - test_acc
                
                if gap > 0.1:
                    recommendations.append(f"{name} shows signs of overfitting (train-test gap: {gap:.4f})")
                elif gap < 0.05:
                    recommendations.append(f"{name} shows good generalization")
            
            # Performance analysis
            avg_accuracy = np.mean([r['metrics']['test_accuracy'] for r in successful_results.values()])
            if avg_accuracy < 0.7:
                recommendations.append("Consider feature engineering or collecting more data")
            elif avg_accuracy > 0.9:
                recommendations.append("Excellent model performance achieved!")
        
        return recommendations
