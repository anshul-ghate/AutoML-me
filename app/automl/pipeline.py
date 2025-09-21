from typing import List, Callable, Any

class Pipeline:
    def __init__(self):
        self.steps = []

    def add_step(self, name: str, func: Callable[..., Any]):
        self.steps.append((name, func))

    def run(self, data):
        results = {}
        current_data = data
        for name, func in self.steps:
            current_data = func(current_data)
            results[name] = current_data
        return results
