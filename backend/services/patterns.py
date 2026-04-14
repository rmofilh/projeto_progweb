import uuid
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from domain.models import Pattern, Collection
from repositories.pattern_repository import PatternRepository

class PatternService:
    def __init__(self, session: AsyncSession):
        self.repository = PatternRepository(session)

    async def get_all_patterns(self, collection_id: Optional[uuid.UUID] = None) -> List[Pattern]:
        return await self.repository.get_all(collection_id=collection_id)

    async def get_pattern_by_id(self, pattern_id: uuid.UUID) -> Optional[Pattern]:
        return await self.repository.get_by_id(pattern_id)

    async def get_all_collections(self) -> List[Collection]:
        return await self.repository.get_collections()
