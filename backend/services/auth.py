import uuid
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from sqlalchemy.future import select
from sqlmodel.ext.asyncio.session import AsyncSession
from domain.models import User, MagicLink
import os

# Configurações simples (deveriam vir de um core/config futuramente)
SECRET_KEY = os.getenv("SECRET_KEY", "fio-e-luz-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 semana
MAGIC_LINK_EXPIRE_MINUTES = 15

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_user(self, email: str) -> User:
        statement = select(User).where(User.email == email)
        result = await self.session.execute(statement)
        user = result.scalar_one_or_none()

        if not user:
            user = User(email=email)
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
        
        return user

    async def create_magic_link(self, user_id: uuid.UUID) -> str:
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=MAGIC_LINK_EXPIRE_MINUTES)
        
        magic_link = MagicLink(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        self.session.add(magic_link)
        await self.session.commit()
        
        # Simulação de envio de e-mail conforme requisito
        print(f"\n[EMAIL SIMULATION] To: {user_id}")
        print(f"[EMAIL SIMULATION] Link: https://fioeluz.app/verify?token={token}")
        print(f"[EMAIL SIMULATION] Expires in {MAGIC_LINK_EXPIRE_MINUTES} minutes\n")
        
        return token

    async def verify_magic_link(self, token: str) -> Optional[User]:
        statement = select(MagicLink).where(MagicLink.token == token, MagicLink.used == False)
        result = await self.session.execute(statement)
        magic_link = result.scalar_one_or_none()

        if not magic_link:
            return None

        if magic_link.expires_at < datetime.utcnow():
            return None

        # Marca como usado
        magic_link.used = True
        self.session.add(magic_link)
        
        # Busca o usuário
        user_statement = select(User).where(User.id == magic_link.user_id)
        user_result = await self.session.execute(user_statement)
        user = user_result.scalar_one_or_none()

        if user:
            user.last_login_at = datetime.utcnow()
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)

        return user

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
