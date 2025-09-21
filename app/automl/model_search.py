from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from .hp_tuner import OptunaTuner

class AutoML:
    def __init__(self, estimator_cls, param_space, tuner: OptunaTuner = None):
        self.estimator_cls = estimator_cls
        self.param_space = param_space
        self.tuner = tuner or OptunaTuner()

    def run(self, X, y, use_random_search=False, n_iter=10):
        if use_random_search:
            search = RandomizedSearchCV(self.estimator_cls(), self.param_space, n_iter=n_iter, cv=3, n_jobs=-1)
            search.fit(X, y)
            return search.best_estimator_, search.best_params_
        else:
            return self.tuner.tune(self.estimator_cls, self.param_space, X, y)

