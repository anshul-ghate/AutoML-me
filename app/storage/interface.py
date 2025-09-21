import abc

class StorageInterface(abc.ABC):
    """Abstract base class for storage backends."""

    @abc.abstractmethod
    def save_file(self, path: str, data: bytes) -> str:
        """Save bytes data to path. Returns the storage path."""
        pass

    @abc.abstractmethod
    def read_file(self, path: str) -> bytes:
        """Read bytes data from path."""
        pass

    @abc.abstractmethod
    def delete_file(self, path: str) -> None:
        """Delete file at path."""
        pass
