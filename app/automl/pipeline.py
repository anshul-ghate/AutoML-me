import cachetools.func
from concurrent.futures import ThreadPoolExecutor
from typing import List, Callable, Any

class Pipeline:
    def __init__(self, max_workers: int = 4):
        self.steps = []
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    def add_step(self, name: str, func: Callable[..., Any], cache: bool = False):
        """cache: whether to memoize this step’s output."""
        if cache:
            func = cachetools.func.ttl_cache(maxsize=32, ttl=600)(func)
        self.steps.append((name, func))

    def run(self, data):
        results = {}
        current_data = data
        for name, func in self.steps:
            # Run each step synchronously; parallelism across independent pipelines can be handled externally
            current_data = func(current_data)
            results[name] = current_data
        return results

