import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from use_cases.ports.auth import ITokenProvider

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if not SECRET_KEY:
    if ENVIRONMENT == "production":
        raise RuntimeError("SECRET_KEY environment variable is required in production")
    SECRET_KEY = "fio-e-luz-secret-key-2026"
    logger.warning("SECRET_KEY not set — using development fallback")

ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * JWT_EXPIRE_HOURS

class JWTTokenProvider(ITokenProvider):
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Concrete JWT implementation for token providence."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
