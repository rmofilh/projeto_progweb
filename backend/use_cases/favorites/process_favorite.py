import asyncio
from uuid import UUID
from domain.repositories.interfaces import IFavoriteRepository
from domain.entities.user_pattern import UserPattern

class ProcessFavoriteEventUseCase:
    def __init__(self, favorite_repo: IFavoriteRepository):
        self.favorite_repo = favorite_repo

    async def execute(self, user_id: UUID, pattern_id: UUID):
        """
        Orchestrates the background processing of a favorite event.
        Ensures entity behavior is invoked and state is persisted.
        """
        favorite = await self.favorite_repo.get_by_user_and_pattern(user_id, pattern_id)
        if not favorite:
            return False

        if favorite.status == "DONE":
            return True

        # Simulate heavy work (as requested in original worker)
        print(f"Processing assets for favorite {user_id}:{pattern_id}...")
        await asyncio.sleep(2)

        # Invoke Rich Domain behavior
        favorite.mark_as_done()
        
        # Persist updated state
        await self.favorite_repo.update(favorite)
        return True
