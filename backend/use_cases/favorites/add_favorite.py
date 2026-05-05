from uuid import UUID
from domain.repositories.interfaces import IFavoriteRepository, IUserRepository
from use_cases.ports.messaging import IMessagingProtocol
from domain.exceptions.base import LimitReachedException, EntityNotFoundException
from domain.entities.user_pattern import UserPattern

class AddFavoriteUseCase:
    def __init__(
        self, 
        favorite_repo: IFavoriteRepository,
        user_repo: IUserRepository,
        messaging: IMessagingProtocol
    ):
        self.favorite_repo = favorite_repo
        self.user_repo = user_repo
        self.messaging = messaging

    async def execute(self, user_id: UUID, pattern_id: UUID, correlation_id: str):
        """
        Orchestrates the addition of a favorite pattern to a user's collection.
        Enforces persistence-based idempotency and domain business rules.
        """
        # 1. Persistence-based Idempotency Check
        if await self.favorite_repo.exists_correlation_id(correlation_id):
            return {"status": "already_processed", "correlation_id": correlation_id}

        # 2. Retrieve Domain Entity (User)
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundException(f"User {user_id} not found")

        # 3. Request Domain behavior check (Limit Rule)
        current_count = await self.favorite_repo.get_count_for_user(user_id)
        if not user.can_favorite(current_count):
            raise LimitReachedException("Limite de 100 favoritos atingido no seu Baú Pessoal.")

        # 4. Check for duplicate logical favoriting
        existing = await self.favorite_repo.get_by_user_and_pattern(user_id, pattern_id)
        if existing:
            await self.favorite_repo.register_correlation_id(correlation_id)
            return {"status": "already_favorited", "correlation_id": correlation_id}

        # 5. Domain operation: Initial registration (EDA Outbox pattern)
        favorite = UserPattern(user_id=user_id, pattern_id=pattern_id, status="PROCESSING")
        await self.favorite_repo.add(favorite)
        
        # 6. Persist correlation ID to prevent concurrent processing
        await self.favorite_repo.register_correlation_id(correlation_id)

        # 7. Dispatch asynchronous event via Application Port
        await self.messaging.publish(
            topic="favorites_queue",
            payload={"user_id": str(user_id), "pattern_id": str(pattern_id)},
            correlation_id=correlation_id
        )

        return {"status": "processing", "correlation_id": correlation_id}
