from uuid import UUID
from domain.repositories.interfaces import IFavoriteRepository
from domain.exceptions.base import EntityNotFoundException

class RemoveFavoriteUseCase:
    def __init__(self, favorite_repo: IFavoriteRepository):
        self.favorite_repo = favorite_repo

    async def execute(self, user_id: UUID, pattern_id: UUID):
        existing = await self.favorite_repo.get_by_user_and_pattern(user_id, pattern_id)
        if not existing:
            raise EntityNotFoundException("Favorite not found")
        await self.favorite_repo.delete(user_id, pattern_id)
        return {"status": "removed"}
