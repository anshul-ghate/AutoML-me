import optuna
from abc import ABC, abstractmethod
from sklearn.model_selection import cross_val_score
import logging
import sys

logger = logging.getLogger(__name__)

class HyperparameterTuner(ABC):
    @abstractmethod
    def tune(self, estimator_cls, param_space: dict, X, y):
        pass

class OptunaTuner(HyperparameterTuner):
    def __init__(self, n_trials: int = 50, timeout: int = 600):
        self.n_trials = n_trials
        self.timeout = timeout
        self.failed_trials = 0
        self.max_failed_trials = 10

    def _manage_cache_size(self, cache):
        """Prevent cache from growing too large"""
        if sys.getsizeof(cache) > 100_000_000:  # 100MB limit
            oldest_keys = list(cache.keys())[:len(cache)//2]
            for key in oldest_keys:
                del cache[key]

    def tune(self, estimator_cls, param_space: dict, X, y):
        def objective(trial):
            params = {}
            for name, choices in param_space.items():
                if isinstance(choices, list):
                    # Use suggest_categorical for list of choices
                    params[name] = trial.suggest_categorical(name, choices)
                elif isinstance(choices, dict):
                    if choices.get("type") == "float":
                        params[name] = trial.suggest_float(name, choices["low"], choices["high"])
                    elif choices.get("type") == "int":
                        params[name] = trial.suggest_int(name, choices["low"], choices["high"])
                    else:
                        # Default to categorical if type not specified
                        params[name] = trial.suggest_categorical(name, list(choices.values()))

            try:
                model = estimator_cls(**params)
                score = cross_val_score(model, X, y, cv=3, n_jobs=-1).mean()
                return score
            except Exception as e:
                self.failed_trials += 1
                logger.warning(f"Model failed with params {params}: {e}")
                
                # Stop optimization if too many failures
                if self.failed_trials > self.max_failed_trials:
                    logger.error(f"Too many failed trials ({self.failed_trials}). Stopping optimization.")
                    raise optuna.exceptions.TrialPruned()
                
                # Return a low score if model fails
                return 0.0

        try:
            study = optuna.create_study(direction="maximize")
            study.optimize(objective, n_trials=self.n_trials, timeout=self.timeout)
            
            if study.best_params is None:
                raise ValueError("No successful trials found. Check your parameter space and data.")
            
            best_params = study.best_params
            best_model = estimator_cls(**best_params)
            best_model.fit(X, y)
            
            logger.info(f"Best parameters found: {best_params}")
            logger.info(f"Best score: {study.best_value}")
            
            return best_model, best_params
            
        except Exception as e:
            logger.error(f"Hyperparameter tuning failed: {e}")
            # Fallback to default parameters
            default_model = estimator_cls()
            default_model.fit(X, y)
            logger.warning("Using default parameters as fallback")
            return default_model, {}

class BayesianTuner(HyperparameterTuner):
    """Enhanced Bayesian optimization with additional features"""
    
    def __init__(self, n_trials: int = 100, timeout: int = 1200, 
                 early_stopping_rounds: int = 20):
        self.n_trials = n_trials
        self.timeout = timeout
        self.early_stopping_rounds = early_stopping_rounds

    def tune(self, estimator_cls, param_space: dict, X, y):
        def objective(trial):
            params = self._suggest_params(trial, param_space)
            
            try:
                model = estimator_cls(**params)
                scores = cross_val_score(model, X, y, cv=5, n_jobs=-1, scoring='accuracy')
                return scores.mean()
            except Exception as e:
                logger.warning(f"Trial failed: {e}")
                return 0.0

        study = optuna.create_study(
            direction="maximize",
            pruner=optuna.pruners.MedianPruner(
                n_startup_trials=5,
                n_warmup_steps=10,
                interval_steps=1
            )
        )
        
        study.optimize(
            objective, 
            n_trials=self.n_trials, 
            timeout=self.timeout,
            callbacks=[self._early_stopping_callback]
        )
        
        best_params = study.best_params
        best_model = estimator_cls(**best_params)
        best_model.fit(X, y)
        
        return best_model, best_params

    def _suggest_params(self, trial, param_space):
        """Enhanced parameter suggestion with more types"""
        params = {}
        for name, choices in param_space.items():
            if isinstance(choices, list):
                params[name] = trial.suggest_categorical(name, choices)
            elif isinstance(choices, dict):
                param_type = choices.get("type", "categorical")
                if param_type == "float":
                    log_scale = choices.get("log", False)
                    params[name] = trial.suggest_float(
                        name, choices["low"], choices["high"], log=log_scale
                    )
                elif param_type == "int":
                    log_scale = choices.get("log", False)
                    params[name] = trial.suggest_int(
                        name, choices["low"], choices["high"], log=log_scale
                    )
                else:
                    params[name] = trial.suggest_categorical(name, list(choices.values()))
        return params

    def _early_stopping_callback(self, study, trial):
        """Stop optimization if no improvement for several trials"""
        if len(study.trials) > self.early_stopping_rounds:
            recent_values = [t.value for t in study.trials[-self.early_stopping_rounds:] 
                           if t.value is not None]
            if len(recent_values) == self.early_stopping_rounds:
                if max(recent_values) <= study.best_value:
                    study.stop()

