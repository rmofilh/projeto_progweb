from uuid import UUID

from domain.entities.pattern import Pattern
from domain.repositories.interfaces import IFavoriteRepository, IPatternRepository


class ListFavoritesUseCase:
    def __init__(self, favorite_repo: IFavoriteRepository, pattern_repo: IPatternRepository):
        self.favorite_repo = favorite_repo
        self.pattern_repo = pattern_repo

    async def execute(self, user_id: UUID) -> list[Pattern]:
        favorites = await self.favorite_repo.get_by_user(user_id)
        patterns = []
        for fav in favorites:
            pattern = await self.pattern_repo.get_by_id(fav.pattern_id)
            if pattern:
                patterns.append(pattern)
        return patterns
