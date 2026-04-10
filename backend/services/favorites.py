import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from domain.models import UserPattern
from services.messaging import broker

class FavoriteService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_favorite(self, user_id: uuid.UUID, pattern_id: uuid.UUID, correlation_id: str) -> dict:
        """
        Responsibility isolated. (Correção 5)
        Creates Outbox Initial Record before dispatching (Correção 1).
        """
        # Passo 1: Outbox Pattern inicial - salvando a intenção de forma resiliente
        user_pattern = UserPattern(
            user_id=user_id,
            pattern_id=pattern_id,
            status="PROCESSING" # Correção 1: Registra rastreabilidade antes do evento
        )
        self.session.add(user_pattern)
        # Correção 2: Tratando DB puramente como motor Async Otmizado
        await self.session.commit()

        # Passo 2: Emissão do evento de fato ao Message Broker garantindo Correlation ID
        broker.publish(
            topic="favorites_queue",
            payload={"user_id": str(user_id), "pattern_id": str(pattern_id)},
            correlation_id=correlation_id
        )

        return {"status": "processing", "correlation_id": correlation_id}
