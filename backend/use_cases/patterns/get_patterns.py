from uuid import UUID

from domain.entities.collection import Collection
from domain.entities.pattern import Pattern
from domain.repositories.interfaces import IPatternRepository


class GetCatalogUseCase:
    def __init__(self, pattern_repo: IPatternRepository):
        self.pattern_repo = pattern_repo

    async def execute(self, collection_id: UUID | None = None) -> list[Pattern]:
        """Orchestrates catalog retrieval."""
        return await self.pattern_repo.get_all(collection_id)


class GetCollectionsUseCase:
    def __init__(self, pattern_repo: IPatternRepository):
        self.pattern_repo = pattern_repo

    async def execute(self) -> list[Collection]:
        """Orchestrates collection list retrieval."""
        return await self.pattern_repo.get_collections()


class GetPatternByIdUseCase:
    def __init__(self, pattern_repo: IPatternRepository):
        self.pattern_repo = pattern_repo

    async def execute(self, pattern_id: UUID) -> Pattern | None:
        return await self.pattern_repo.get_by_id(pattern_id)
