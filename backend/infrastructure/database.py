import os
import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/fioeluz")
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"
engine = create_async_engine(DATABASE_URL, echo=SQL_ECHO, future=True)

# Important: Import models here so they are registered with SQLModel.metadata
from adapters.persistence.sqlmodel.models import SQLModel as PersistenceSQLModel  # noqa: E402

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

ALEMBIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "alembic")
BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))

def _run_alembic_upgrade():
    from alembic.config import Config
    from alembic import command
    alembic_cfg = Config(os.path.join(BACKEND_DIR, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", ALEMBIC_DIR)
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
    command.upgrade(alembic_cfg, "head")

async def run_alembic_migrations():
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _run_alembic_upgrade)

async def create_db_and_tables():
    if os.path.exists(ALEMBIC_DIR):
        logger.info("Running Alembic migrations...")
        try:
            await run_alembic_migrations()
            logger.info("Alembic migrations applied successfully")
        except Exception as e:
            logger.error("Alembic migration failed: %s", e)
            raise RuntimeError(f"Database migration failed: {e}")
    else:
        logger.warning("No Alembic directory found — using create_all fallback")
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

    async with engine.begin() as conn:
        await conn.execute(text(CREATE_FUNCTION_SQL))
        await conn.execute(text(DROP_TRIGGER_SQL))
        await conn.execute(text(CREATE_TRIGGER_SQL))

async def get_session():
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
