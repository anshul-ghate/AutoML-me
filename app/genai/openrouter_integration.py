import os
import requests
import json

class OpenRouterClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable not set")

    def chat_completion(self, model: str, messages: list, referer: str = None, title: str = None):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }
        if referer:
            headers["HTTP-Referer"] = referer
        if title:
            headers["X-Title"] = title

        data = {
            "model": model,
            "messages": messages
        }

        response = requests.post(self.api_url, headers=headers, data=json.dumps(data), timeout=15)
        response.raise_for_status()
        return response.json()
