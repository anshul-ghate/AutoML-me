import os
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory user store for demo; replace with DB in prod
users_db = {}

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "change-me")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_MINUTES = 30

@router.post("/register")
async def register(user: UserRegister = Body(...)):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User.create(user.username, user.email, user.password)
    users_db[user.username] = new_user
    return {"msg": "User registered successfully"}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    payload = {
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_DELTA_MINUTES)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
