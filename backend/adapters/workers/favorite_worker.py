import asyncio
import logging
import uuid

from sqlmodel.ext.asyncio.session import AsyncSession

from adapters.persistence.sqlmodel.repositories import SQLFavoriteRepository
from infrastructure.database import engine
from use_cases.favorites.process_favorite import ProcessFavoriteEventUseCase

logger = logging.getLogger(__name__)


async def process_favorite_event(envelope: dict):
    """
    Adapter for background events.
    Receives messages, extracts data, calls use cases, and handles transaction boundary.
    """
    correlation_id = envelope.get("correlation_id")
    payload = envelope.get("data")
    if payload is None:
        logger.error("[%s] No data payload in event", correlation_id)
        return
    user_id = uuid.UUID(payload["user_id"])
    pattern_id = uuid.UUID(payload["pattern_id"])

    async with AsyncSession(engine) as session:
        repo = SQLFavoriteRepository(session)
        use_case = ProcessFavoriteEventUseCase(repo)

        try:
            success = await use_case.execute(user_id, pattern_id)
            if success:
                # Transactional boundary: Commit the background processing results
                await session.commit()
                logger.info(
                    "[%s] Successfully processed %s:%s", correlation_id, user_id, pattern_id
                )
        except Exception as e:
            await session.rollback()
            logger.error("[%s] Failed to process event: %s", correlation_id, e)


async def worker_loop():
    logger.info("Worker consuming queues...")
    while True:
        await asyncio.sleep(60)


if __name__ == "__main__":
    asyncio.run(worker_loop())
