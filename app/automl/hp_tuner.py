import optuna
from abc import ABC, abstractmethod
from sklearn.model_selection import cross_val_score

class HyperparameterTuner(ABC):
    @abstractmethod
    def tune(self, estimator_cls, param_space: dict, X, y):
        pass

class OptunaTuner(HyperparameterTuner):
    def __init__(self, n_trials: int = 50, timeout: int = 600):
        self.n_trials = n_trials
        self.timeout = timeout

    def tune(self, estimator_cls, param_space: dict, X, y):
        def objective(trial):
            params = {}
            for name, choices in param_space.items():
                if isinstance(choices, list):
                    params[name] = trial.choice(choices)
                elif isinstance(choices, dict) and choices.get("type") == "float":
                    params[name] = trial.suggest_float(name, choices["low"], choices["high"])
                elif isinstance(choices, dict) and choices.get("type") == "int":
                    params[name] = trial.suggest_int(name, choices["low"], choices["high"])
            model = estimator_cls(**params)
            score = cross_val_score(model, X, y, cv=3, n_jobs=-1).mean()
            return score

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=self.n_trials, timeout=self.timeout)
        best_params = study.best_params
        best_model = estimator_cls(**best_params)
        best_model.fit(X, y)
        return best_model, best_params
