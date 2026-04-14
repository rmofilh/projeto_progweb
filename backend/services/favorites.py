import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from repositories.favorite_repository import FavoriteRepository
from services.messaging import broker

class FavoriteService:
    def __init__(self, session: AsyncSession):
        self.repository = FavoriteRepository(session)

    async def add_favorite(self, user_id: uuid.UUID, pattern_id: uuid.UUID, correlation_id: str) -> dict:
        """
        Gerecia a lógica de favoritar utilizando o repositório para persistência.
        Inclui checagem de limite e idempotência.
        """
        # Checagem de limite (Regra de Negócio: Max 100)
        count = await self.repository.get_count_for_user(user_id)
        if count >= 100:
            return {"status": "error", "message": "Limite de 100 favoritos atingido no seu Baú Pessoal."}

        # Checagem de Idempotência: Se já existe, apenas ignora
        existing = await self.repository.get_by_user_and_pattern(user_id, pattern_id)
        if existing:
            return {"status": "already_favorited", "correlation_id": correlation_id}

        # Passo 1: Registro inicial resiliente (Outbox)
        await self.repository.add(user_id, pattern_id)

        # Passo 2: Emissão do evento de fato ao Message Broker
        broker.publish(
            topic="favorites_queue",
            payload={"user_id": str(user_id), "pattern_id": str(pattern_id)},
            correlation_id=correlation_id
        )

        return {"status": "processing", "correlation_id": correlation_id}
