from uuid import UUID
from typing import List, Optional
from domain.repositories.interfaces import IPatternRepository
from domain.entities.pattern import Pattern
from domain.entities.collection import Collection

class GetCatalogUseCase:
    def __init__(self, pattern_repo: IPatternRepository):
        self.pattern_repo = pattern_repo

    async def execute(self, collection_id: Optional[UUID] = None) -> List[Pattern]:
        """Orchestrates catalog retrieval."""
        return await self.pattern_repo.get_all(collection_id)

class GetCollectionsUseCase:
    def __init__(self, pattern_repo: IPatternRepository):
        self.pattern_repo = pattern_repo

    async def execute(self) -> List[Collection]:
        """Orchestrates collection list retrieval."""
        return await self.pattern_repo.get_collections()
