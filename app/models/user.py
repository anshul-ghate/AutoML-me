from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    username: str
    email: EmailStr
    hashed_password: str

    @classmethod
    def create(cls, username: str, email: str, password: str) -> "User":
        hashed = pwd_context.hash(password)
        return cls(username=username, email=email, hashed_password=hashed)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)
