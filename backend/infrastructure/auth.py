import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from use_cases.ports.auth import ITokenProvider

SECRET_KEY = os.getenv("SECRET_KEY", "fio-e-luz-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

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
