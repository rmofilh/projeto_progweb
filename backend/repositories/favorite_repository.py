import uuid
from typing import Optional
from sqlalchemy.future import select
from sqlalchemy import func
from sqlmodel.ext.asyncio.session import AsyncSession
from domain.models import UserPattern

class FavoriteRepository:
    """
    Abstração para persistência de dados de favoritos (Baú Pessoal).
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_count_for_user(self, user_id: uuid.UUID) -> int:
        statement = select(func.count()).select_from(UserPattern).where(UserPattern.user_id == user_id)
        result = await self.session.execute(statement)
        return result.scalar() or 0

    async def add(self, user_id: uuid.UUID, pattern_id: uuid.UUID) -> UserPattern:
        user_pattern = UserPattern(
            user_id=user_id,
            pattern_id=pattern_id,
            status="PROCESSING"
        )
        self.session.add(user_pattern)
        # Commit will be handled by the service to maintain transaction control if needed, 
        # but here we do it for direct usage.
        await self.session.commit()
        await self.session.refresh(user_pattern)
        return user_pattern

    async def get_by_user_and_pattern(self, user_id: uuid.UUID, pattern_id: uuid.UUID) -> Optional[UserPattern]:
        statement = select(UserPattern).where(
            UserPattern.user_id == user_id, 
            UserPattern.pattern_id == pattern_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
