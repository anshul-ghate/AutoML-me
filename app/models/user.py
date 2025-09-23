import os
import json
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt

USERS_DB_PATH = os.getenv("USERS_DB_PATH", "data/users.json")


class User(BaseModel):
    username: str
    email: EmailStr
    password_hash: str


def _ensure_db_dir():
    db_dir = os.path.dirname(USERS_DB_PATH) or "."
    os.makedirs(db_dir, exist_ok=True)


def _read_db() -> Dict[str, Any]:
    _ensure_db_dir()
    if not os.path.exists(USERS_DB_PATH):
        return {"users": []}
    try:
        with open(USERS_DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f) or {"users": []}
    except json.JSONDecodeError:
        return {"users": []}


def _write_db(data: Dict[str, Any]) -> None:
    _ensure_db_dir()
    with open(USERS_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_user(username: str) -> Optional[User]:
    db = _read_db()
    for u in db.get("users", []):
        if u.get("username") == username:
            return User(**u)
    return None


def create_user(username: str, email: str, password: str) -> User:
    if not username or not password:
        raise ValueError("Username and password are required")
    db = _read_db()
    # Uniqueness checks
    for u in db.get("users", []):
        if u.get("username") == username:
            raise ValueError("Username already exists")
        if u.get("email") == email:
            raise ValueError("Email already exists")

    password_hash = bcrypt.hash(password)
    user = User(username=username, email=email, password_hash=password_hash)
    db.setdefault("users", []).append(user.dict())
    _write_db(db)
    return user


def verify_user(username: str, password: str) -> Optional[User]:
    user = get_user(username)
    if not user:
        return None
    if not bcrypt.verify(password, user.password_hash):
        return None
    return user

