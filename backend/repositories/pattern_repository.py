import uuid
from typing import List, Optional
from sqlalchemy.future import select
from sqlmodel.ext.asyncio.session import AsyncSession
from domain.models import Pattern, Collection

class PatternRepository:
    """
    Abstração para persistência de dados do catálogo.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, collection_id: Optional[uuid.UUID] = None) -> List[Pattern]:
        statement = select(Pattern)
        if collection_id:
            statement = statement.where(Pattern.collection_id == collection_id)
        result = await self.session.execute(statement)
        return result.scalars().all()

    async def get_by_id(self, pattern_id: uuid.UUID) -> Optional[Pattern]:
        statement = select(Pattern).where(Pattern.id == pattern_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_collections(self) -> List[Collection]:
        statement = select(Collection)
        result = await self.session.execute(statement)
        return result.scalars().all()
