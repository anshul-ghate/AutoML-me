from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.genai.provider import OpenRouterProvider
from app.auth.jwt_auth import JWTBearer

router = APIRouter(prefix="/genai", tags=["genai"])
provider = OpenRouterProvider()

class Message(BaseModel):
    role: str = Field(..., description="Role of the message sender (user, assistant, system)")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    model_key: str = Field("grok-4-fast", description="Select model by key")
    messages: List[Message]

@router.post("/chat", dependencies=[Depends(JWTBearer())])
async def chat_completion(request: ChatRequest):
    try:
        response = provider.chat_completion(request.model_key, [m.dict() for m in request.messages])
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
