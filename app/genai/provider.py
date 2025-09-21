from abc import ABC, abstractmethod
from app.genai.openrouter_integration import OpenRouterClient

class GenAIProvider(ABC):
    @abstractmethod
    def chat_completion(self, model: str, messages: list):
        pass

class OpenRouterProvider(GenAIProvider):
    # Supported models: can add/disable models here easily
    SUPPORTED_MODELS = {
        "grok-4-fast": "x-ai/grok-4-fast:free",
        "nemotron": "nvidia/nemotron-nano-9b-v2:free",
        "mistral-small": "mistralai/mistral-small-3.2-24b-instruct:free",
        "deepseek-v3": "deepseek/v3.1"
    }

    def __init__(self, api_key: str = None):
        self.client = OpenRouterClient(api_key)

    def chat_completion(self, model_key: str, messages: list):
        # If the key matches a known alias, use its mapped model.
        # Otherwise assume model_key is already a full model identifier.
        if model_key in self.SUPPORTED_MODELS:
            model = self.SUPPORTED_MODELS[model_key]
        else:
            # Directly use the provided model string
            model = model_key
        return self.client.chat_completion(model, messages)
