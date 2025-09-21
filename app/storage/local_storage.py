import gzip
import os
from pathlib import Path
from app.storage.interface import StorageInterface

class LocalStorage(StorageInterface):
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _get_full_path(self, path: str) -> Path:
        return self.base_path / path

    def save_file(self, path: str, data: bytes) -> str:
        full_path = self._get_full_path(path)
        full_path.parent.mkdir(parents=True, exist_ok=True)

        if len(data) > 1_000_000:  # Compress if file > 1MB
            compressed_path = str(full_path) + ".gz"
            try:
                with gzip.open(compressed_path, 'wb') as f:
                    f.write(data)
            except Exception:
                # Add logging or error handling here
                pass
            return compressed_path
        else:
            try:
                with open(full_path, 'wb') as f:
                    f.write(data)
            except Exception:
                # Add logging or error handling here
                pass
            return str(full_path)

    def read_file(self, path: str) -> bytes:
        try:
            if path.endswith('.gz'):
                with gzip.open(path, 'rb') as f:
                    return f.read()
            else:
                with open(path, 'rb') as f:
                    return f.read()
        except Exception:
            # Add logging or error handling here
            pass

    def delete_file(self, path: str) -> None:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            # Add logging or error handling here
            pass
