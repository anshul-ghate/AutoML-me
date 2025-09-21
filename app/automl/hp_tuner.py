from abc import ABC, abstractmethod

class HyperparameterTuner(ABC):
    @abstractmethod
    def tune(self, estimator, param_space, X, y):
        pass
