from sklearn.model_selection import GridSearchCV

class ModelSearch:
    def __init__(self, estimator, param_grid, cv=3, scoring=None):
        self.estimator = estimator
        self.param_grid = param_grid
        self.cv = cv
        self.scoring = scoring
        self.grid_search = None

    def search(self, X, y):
        self.grid_search = GridSearchCV(
            self.estimator,
            self.param_grid,
            cv=self.cv,
            scoring=self.scoring,
            n_jobs=-1
        )
        self.grid_search.fit(X, y)
        return self.grid_search.best_estimator_, self.grid_search.best_params_
