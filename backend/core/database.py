import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/fioeluz")
# Engine needs asyncpg
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

from sqlalchemy import text
from domain.models import SQLModel # Ensure models are registered

CREATE_FUNCTION_SQL = """
CREATE OR REPLACE FUNCTION check_user_favorites_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT count(*) FROM user_patterns WHERE user_id = NEW.user_id) >= 100 THEN
        RAISE EXCEPTION 'Limite de 100 favoritos atingido para este usuário.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
"""

DROP_TRIGGER_SQL = "DROP TRIGGER IF EXISTS trg_limit_user_favorites ON user_patterns;"

CREATE_TRIGGER_SQL = """
CREATE TRIGGER trg_limit_user_favorites
BEFORE INSERT ON user_patterns
FOR EACH ROW EXECUTE FUNCTION check_user_favorites_limit();
"""

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        # Executa comandos separadamente devido à limitação do asyncpg
        await conn.execute(text(CREATE_FUNCTION_SQL))
        await conn.execute(text(DROP_TRIGGER_SQL))
        await conn.execute(text(CREATE_TRIGGER_SQL))

async def get_session():
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
