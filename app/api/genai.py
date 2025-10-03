from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import os

router = APIRouter(prefix="/genai", tags=["genai"])

# Base model with protected namespaces fix
class APIModel(BaseModel):
    model_config = {'protected_namespaces': ()}

# Define ChatMessage FIRST (before ChatRequest uses it)
class ChatMessage(APIModel):
    role: str
    content: str

class ChatRequest(APIModel):
    model_key: str
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class ChatChoice(APIModel):
    message: ChatMessage
    finish_reason: Optional[str] = None

class ChatResponse(APIModel):
    choices: List[ChatChoice]
    usage: Optional[Dict[str, int]] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Chat with AI using OpenRouter API"""
    try:
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if not openrouter_key:
            raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
        
        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": request.model_key,
            "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
            "temperature": request.temperature,
            "max_tokens": request.max_tokens
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            data = response.json()
            
            return ChatResponse(
                choices=[
                    ChatChoice(
                        message=ChatMessage(
                            role=choice["message"]["role"],
                            content=choice["message"]["content"]
                        ),
                        finish_reason=choice.get("finish_reason")
                    )
                    for choice in data["choices"]
                ],
                usage=data.get("usage")
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
