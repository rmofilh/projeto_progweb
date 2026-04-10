import asyncio
import uuid
import json
# import redis
from sqlalchemy.future import select
from core.database import get_session, engine
from domain.models import UserPattern
from sqlmodel.ext.asyncio.session import AsyncSession

# redis_client = redis.Redis(host='redis', port=6379, db=0)

async def process_favorite_event(envelope: dict):
    """
    Simula o processador da fila.
    """
    correlation_id = envelope.get("correlation_id")
    payload = envelope.get("data")
    user_id = uuid.UUID(payload["user_id"])
    pattern_id = uuid.UUID(payload["pattern_id"])
    
    # Injeta a DB Session assíncrona
    async with AsyncSession(engine) as session:
        # Correção 4: Idempotência garantida lendo do banco antes.
        statement = select(UserPattern).where(
            UserPattern.user_id == user_id, 
            UserPattern.pattern_id == pattern_id
        )
        result = await session.execute(statement)
        user_pattern = result.scalar_one_or_none()

        if not user_pattern:
            return  # Caso não ache nem o registro PROCESSING, dropa.
            
        if user_pattern.status == "DONE":
            print(f"[IDEMPOTÊNCIA] Evento {correlation_id} ignorado, já finalizado.")
            return

        try:
            # ------- AQUI VAI O TRABALHO PESADO DE VERDADE -------
            print(f"[{correlation_id}] Gerando assets e cruzando dados difíceis...")
            await asyncio.sleep(2) # Simula peso
            # -----------------------------------------------------

            user_pattern.status = "DONE"
            await session.commit()
            print(f"[{correlation_id}] Finalizado com Sucesso.")

        except Exception as e:
            await session.rollback()
            # Correção 3: Dead Letter Queue clara se o processamento explodir hard
            # redis_client.lpush("dlq_favorites", json.dumps(envelope))
            print(f"[{correlation_id}] FAILED. Movido para DLQ: {e}")

# Fake loop runner
async def worker_loop():
    print("Worker consumindo filas na rede...")
    while True:
        # Pega da fila do RabbitMQ / Redis
        # raw_msg = redis_client.brpop("favorites_queue")
        await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(worker_loop())
