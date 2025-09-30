import httpx
import os
from typing import Dict, Any, List, Optional
import asyncio

class AIClient:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        self.openai_url = "https://api.openai.com/v1/chat/completions"
        
    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://automl-platform.com",
            "X-Title": "AutoML Platform"
        }
    
    async def create_completion(
        self, 
        model: str, 
        messages: List[Dict[str, Any]], 
        max_tokens: Optional[int] = 1000,
        temperature: Optional[float] = 0.7
    ) -> Dict[str, Any]:
        """Create a chat completion"""
        
        # Determine which API to use based on model
        if model.startswith("gpt-"):
            url = self.openai_url
        else:
            url = self.openrouter_url
            
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json=payload
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    # Fallback response
                    return {
                        "choices": [{
                            "message": {
                                "content": f"I apologize, but I'm currently unable to process your request. Error: {response.status_code}"
                            }
                        }],
                        "usage": {"total_tokens": 0}
                    }
                    
        except Exception as e:
            # Fallback response
            return {
                "choices": [{
                    "message": {
                        "content": "I apologize, but I'm experiencing technical difficulties. Please try again later."
                    }
                }],
                "usage": {"total_tokens": 0},
                "error": str(e)
            }

# Global client instance
ai_client = AIClient()
