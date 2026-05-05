import asyncio
import uuid
from infrastructure.database import engine
from sqlmodel.ext.asyncio.session import AsyncSession
from adapters.persistence.sqlmodel.repositories import SQLFavoriteRepository
from use_cases.favorites.process_favorite import ProcessFavoriteEventUseCase

async def process_favorite_event(envelope: dict):
    """
    Adapter for background events. 
    Receives messages, extracts data, calls use cases, and handles transaction boundary.
    """
    correlation_id = envelope.get("correlation_id")
    payload = envelope.get("data")
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
                print(f"[{correlation_id}] Successfully processed {user_id}:{pattern_id}")
        except Exception as e:
            await session.rollback()
            print(f"[{correlation_id}] Failed to process event: {e}")

async def worker_loop():
    print("Worker consuming queues...")
    while True:
        await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(worker_loop())
