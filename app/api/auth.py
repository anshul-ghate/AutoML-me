from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.models.user import User, create_user, verify_user
from app.auth.jwt_auth import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    try:
        user = verify_user(request.username, request.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/register")
async def register(request: RegisterRequest):
    try:
        user = create_user(request.username, request.email, request.password)
        return {"message": "User created successfully", "username": user.username}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

