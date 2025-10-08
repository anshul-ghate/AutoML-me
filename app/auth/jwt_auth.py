import os
import json
import redis
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from jose import JWTError, jwt
from fastapi import HTTPException, Request, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from pydantic import BaseModel
import logging
from functools import lru_cache

# ✅ Enhanced Configuration with Environment Variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))  # Extended to 60 mins
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
RATE_LIMIT_REQUESTS_PER_HOUR = int(os.getenv("RATE_LIMIT_REQUESTS_PER_HOUR", "1000"))

# ✅ Enhanced Security - Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Redis Connection for Session Management & Rate Limiting
try:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    redis_client.ping()  # Test connection
except Exception as e:
    logging.warning(f"Redis connection failed: {e}. Session management and rate limiting disabled.")
    redis_client = None

# ✅ Enhanced Models
class TokenData(BaseModel):
    user_id: str
    username: Optional[str] = None
    email: Optional[str] = None
    roles: List[str] = []
    permissions: List[str] = []
    session_id: Optional[str] = None

class UserInDB(BaseModel):
    user_id: str
    username: str
    email: str
    hashed_password: str
    roles: List[str] = ["user"]
    permissions: List[str] = []
    is_active: bool = True
    created_at: datetime
    last_login: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: Dict[str, Any]

# ✅ Enhanced Password Operations
def hash_password(password: str) -> str:
    """Hash password using bcrypt with enhanced security"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

# ✅ Enhanced Token Creation with Session Management
def create_access_token(
    data: Dict[str, Any], 
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access"
) -> str:
    """
    Create JWT access token with enhanced payload and session tracking
    """
    to_encode = data.copy()
    
    # Set expiration based on token type
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    elif token_type == "refresh":
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Enhanced payload
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": token_type,
        "jti": f"{data.get('user_id', 'unknown')}_{int(datetime.utcnow().timestamp())}"  # JWT ID
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # ✅ Store session in Redis for tracking
    if redis_client and token_type == "access":
        session_data = {
            "user_id": data.get("user_id"),
            "username": data.get("username"),
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expire.isoformat(),
            "token_jti": to_encode["jti"]
        }
        session_key = f"session:{data.get('user_id')}:{to_encode['jti']}"
        redis_client.setex(session_key, int(expires_delta.total_seconds()) if expires_delta else ACCESS_TOKEN_EXPIRE_MINUTES * 60, json.dumps(session_data))
    
    return encoded_jwt

def create_refresh_token(user_data: Dict[str, Any]) -> str:
    """Create refresh token for long-term authentication"""
    refresh_data = {
        "user_id": user_data["user_id"],
        "username": user_data.get("username"),
        "type": "refresh"
    }
    return create_access_token(refresh_data, token_type="refresh")

# ✅ Enhanced Token Verification with Session Validation
def verify_token(token: str, token_type: str = "access") -> TokenData:
    """
    Verify JWT token with enhanced validation and session checking
    """
    try:
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected: {token_type}"
            )
        
        # Extract user data
        user_id: str = payload.get("user_id")
        username: str = payload.get("username")
        email: str = payload.get("email")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user information"
            )
        
        # ✅ Validate session in Redis
        if redis_client and token_type == "access":
            jti = payload.get("jti")
            if jti:
                session_key = f"session:{user_id}:{jti}"
                session_data = redis_client.get(session_key)
                if not session_data:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Session expired or invalid"
                    )
        
        # Return enhanced token data
        return TokenData(
            user_id=user_id,
            username=username,
            email=email,
            roles=payload.get("roles", ["user"]),
            permissions=payload.get("permissions", []),
            session_id=payload.get("jti")
        )
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed"
        )

# ✅ Rate Limiting Function
def check_rate_limit(user_id: str, action: str = "api_call") -> bool:
    """
    Check if user has exceeded rate limits
    """
    if not redis_client:
        return True  # Skip rate limiting if Redis unavailable
    
    try:
        key = f"rate_limit:{user_id}:{action}"
        current_count = redis_client.get(key)
        
        if current_count and int(current_count) >= RATE_LIMIT_REQUESTS_PER_HOUR:
            return False
        
        # Increment counter with expiry
        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, 3600)  # 1 hour
        pipe.execute()
        
        return True
    except:
        return True  # Allow on Redis errors

# ✅ Session Management Functions
def invalidate_session(user_id: str, session_id: str = None) -> bool:
    """
    Invalidate specific session or all sessions for a user
    """
    if not redis_client:
        return True
    
    try:
        if session_id:
            # Invalidate specific session
            session_key = f"session:{user_id}:{session_id}"
            return bool(redis_client.delete(session_key))
        else:
            # Invalidate all sessions for user
            pattern = f"session:{user_id}:*"
            keys = redis_client.keys(pattern)
            if keys:
                return bool(redis_client.delete(*keys))
            return True
    except:
        return False

def get_active_sessions(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all active sessions for a user
    """
    if not redis_client:
        return []
    
    try:
        pattern = f"session:{user_id}:*"
        keys = redis_client.keys(pattern)
        sessions = []
        
        for key in keys:
            session_data = redis_client.get(key)
            if session_data:
                sessions.append(json.loads(session_data))
        
        return sessions
    except:
        return []

# ✅ Enhanced JWT Bearer with Rate Limiting and Role-Based Access
class EnhancedJWTBearer(HTTPBearer):
    """
    Enhanced JWT Bearer with rate limiting, session validation, and RBAC
    """
    
    def __init__(
        self, 
        auto_error: bool = True,
        required_roles: List[str] = None,
        required_permissions: List[str] = None,
        enable_rate_limiting: bool = True
    ):
        super().__init__(auto_error=auto_error)
        self.required_roles = required_roles or []
        self.required_permissions = required_permissions or []
        self.enable_rate_limiting = enable_rate_limiting

    async def __call__(self, request: Request) -> TokenData:
        """
        Validate JWT token with enhanced security checks
        """
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Authentication credentials required"
            )
        
        if credentials.scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication scheme. Use Bearer token."
            )
        
        # Verify and decode token
        token_data = self.verify_jwt_token(credentials.credentials)
        
        # ✅ Rate Limiting Check
        if self.enable_rate_limiting:
            if not check_rate_limit(token_data.user_id):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later."
                )
        
        # ✅ Role-Based Access Control
        if self.required_roles:
            if not any(role in token_data.roles for role in self.required_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient privileges. Required roles: {', '.join(self.required_roles)}"
                )
        
        # ✅ Permission-Based Access Control
        if self.required_permissions:
            if not any(perm in token_data.permissions for perm in self.required_permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required: {', '.join(self.required_permissions)}"
                )
        
        return token_data

    def verify_jwt_token(self, token: str) -> TokenData:
        """
        Verify JWT token and return user data
        """
        try:
            return verify_token(token)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired token"
            )

# ✅ Convenience Dependency Functions
def get_current_user(token_data: TokenData = Depends(EnhancedJWTBearer())) -> TokenData:
    """Get current authenticated user"""
    return token_data

def get_admin_user(token_data: TokenData = Depends(EnhancedJWTBearer(required_roles=["admin"]))) -> TokenData:
    """Get current user with admin privileges"""
    return token_data

def get_user_with_permission(permission: str):
    """Factory function to create permission-based dependency"""
    def _get_user(token_data: TokenData = Depends(EnhancedJWTBearer(required_permissions=[permission]))) -> TokenData:
        return token_data
    return _get_user

# ✅ Backward Compatibility Functions (keeping existing interface)
def create_access_token_legacy(data: dict, expires_delta: timedelta = None) -> str:
    """
    Legacy function for backward compatibility
    """
    return create_access_token(data, expires_delta)

def verify_token_legacy(token: str) -> str:
    """
    Legacy function for backward compatibility - returns username
    """
    token_data = verify_token(token)
    return token_data.username or token_data.user_id

# ✅ Legacy JWTBearer class for backward compatibility
class JWTBearer(HTTPBearer):
    """Legacy JWT Bearer class for backward compatibility"""
    
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        try:
            verify_token_legacy(jwtoken)
            return True
        except:
            return False

# ✅ Utility Functions
@lru_cache(maxsize=128)
def get_user_permissions(user_id: str) -> List[str]:
    """
    Get user permissions (cached for performance)
    This would typically query your user database
    """
    # TODO: Implement actual user permission lookup
    # For now, return default permissions
    return ["read", "write"] if user_id else []

def audit_login_attempt(user_id: str, success: bool, ip_address: str = None):
    """
    Audit login attempts for security monitoring
    """
    if redis_client:
        audit_data = {
            "user_id": user_id,
            "success": success,
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": ip_address
        }
        key = f"audit:login:{user_id}:{datetime.utcnow().date()}"
        redis_client.lpush(key, json.dumps(audit_data))
        redis_client.expire(key, 86400 * 30)  # Keep for 30 days

# ✅ Health Check Function
def jwt_health_check() -> Dict[str, Any]:
    """
    Health check for JWT service dependencies
    """
    health = {
        "jwt_service": "healthy",
        "redis_connection": "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if redis_client:
        try:
            redis_client.ping()
            health["redis_connection"] = "healthy"
        except:
            health["redis_connection"] = "unhealthy"
    
    return health
