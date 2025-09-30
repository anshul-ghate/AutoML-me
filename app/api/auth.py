from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from ..auth.jwt_handler import create_access_token
import json
import os

router = APIRouter(prefix="/auth", tags=["authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def load_users():
    try:
        with open("data/users.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"users": []}

def save_users(users_data):
    os.makedirs("data", exist_ok=True)
    with open("data/users.json", "w") as f:
        json.dump(users_data, f, indent=2)

@router.post("/register", response_model=Token)
def register(user: UserRegister):
    users_data = load_users()
    
    # Check if user already exists
    for existing_user in users_data["users"]:
        if existing_user["username"] == user.username or existing_user["email"] == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "email": user.email,
        "password_hash": hashed_password
    }
    
    users_data["users"].append(new_user)
    save_users(users_data)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    users_data = load_users()
    
    # Find user
    user_found = None
    for existing_user in users_data["users"]:
        if existing_user["username"] == user.username:
            user_found = existing_user
            break
    
    if not user_found or not verify_password(user.password, user_found["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}
