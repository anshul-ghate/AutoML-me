import sys
import hashlib
import pickle
from concurrent.futures import ThreadPoolExecutor
from typing import List, Callable, Any, Dict
import numpy as np

class Pipeline:
    def __init__(self, max_workers: int = 4):
        self.steps = []
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.cache = {}
    
    def _manage_cache_size(self):
   	 """Prevent cache from growing too large"""
   	 if sys.getsizeof(self.cache) > 100_000_000:  # 100MB limit
        	oldest_keys = list(self.cache.keys())[:len(self.cache)//2]
        	for key in oldest_keys:
            		del self.cache[key]

    def _hash_data(self, data):
        """Create a hash for numpy arrays or other data types."""
        if isinstance(data, np.ndarray):
            return hashlib.md5(data.tobytes()).hexdigest()
        else:
            return hashlib.md5(pickle.dumps(data)).hexdigest()

    def add_step(self, name: str, func: Callable[..., Any], cache: bool = False):
        """Add a step to the pipeline with optional caching."""
        self.steps.append((name, func, cache))

    def run(self, data):
        results = {}
        current_data = data
        
        for name, func, use_cache in self.steps:
            if use_cache:
                # Create hash key for caching
                data_hash = self._hash_data(current_data)
                cache_key = f"{name}_{data_hash}"
                
                if cache_key in self.cache:
                    current_data = self.cache[cache_key]
                else:
                    current_data = func(current_data)
                    self.cache[cache_key] = current_data
            else:
                current_data = func(current_data)
            
            results[name] = current_data
        
        return results

    def clear_cache(self):
        """Clear the pipeline cache."""
        self.cache.clear()
