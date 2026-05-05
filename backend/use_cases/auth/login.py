from uuid import UUID, uuid4
from datetime import datetime, timedelta
from typing import Optional
from use_cases.ports.auth import IMagicLinkRepository, ITokenProvider
from domain.repositories.interfaces import IUserRepository
from domain.entities.user import User

MAGIC_LINK_EXPIRE_MINUTES = 15

class RequestMagicLinkUseCase:
    def __init__(self, user_repo: IUserRepository, magic_link_repo: IMagicLinkRepository):
        self.user_repo = user_repo
        self.magic_link_repo = magic_link_repo

    async def execute(self, email: str) -> str:
        """Handles magic link request and user auto-provisioning."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            user = User(email=email)
            await self.user_repo.add(user)
        
        token = str(uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=MAGIC_LINK_EXPIRE_MINUTES)
        
        await self.magic_link_repo.add(user.id, token, expires_at)
        
        return token

class VerifyMagicLinkUseCase:
    def __init__(
        self, 
        user_repo: IUserRepository, 
        magic_link_repo: IMagicLinkRepository,
        token_provider: ITokenProvider
    ):
        self.user_repo = user_repo
        self.magic_link_repo = magic_link_repo
        self.token_provider = token_provider

    async def execute(self, token: str) -> Optional[str]:
        """Verifies token and returns a JWT access token."""
        user_id = await self.magic_link_repo.get_valid_user_id(token)
        if not user_id:
            return None
        
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return None
        
        # Invoke behavior on Domain Entity
        user.update_last_login()
        await self.user_repo.update(user)
        
        await self.magic_link_repo.mark_as_used(token)
        
        return self.token_provider.create_access_token(data={"sub": user.email})
