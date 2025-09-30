from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from ..auth.jwt_handler import get_current_user
import os
import openrouter

router = APIRouter(prefix="/genai", tags=["genai"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model_key: str
    messages: List[Message]

class ChatResponse(BaseModel):
    choices: List[Dict[str, Any]]

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: str = Depends(get_current_user)
):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    try:
        client = openrouter.OpenRouter(api_key=OPENROUTER_API_KEY)
        
        response = client.chat.completions.create(
            model=request.model_key,
            messages=[{"role": msg.role, "content": msg.content} for msg in request.messages]
        )
        
        return {
            "choices": [
                {
                    "message": {
                        "role": choice.message.role,
                        "content": choice.message.content
                    }
                }
                for choice in response.choices
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GenAI API error: {str(e)}")
