import os
import jwt
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

class JWTBearer(HTTPBearer):
    """JWT authentication dependency."""
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
        self.secret = os.getenv('JWT_SECRET_KEY', 'change-me')

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            if not credentials.scheme == 'Bearer':
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Invalid authentication scheme.')
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Invalid or expired token.')
            return credentials.credentials
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Invalid authorization code.')

    def verify_jwt(self, token: str) -> bool:
        try:
            payload = jwt.decode(token, self.secret, algorithms=['HS256'])
            # Optional: additional claims validation
            return True
        except jwt.PyJWTError:
            return False

