import pytest
import asyncio
import os
from httpx import AsyncClient
from main import app
import core.database
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlalchemy.pool import NullPool

# Use NullPool to ensure connections are not shared incorrectly between async tasks
# in the test environment, avoiding "another operation is in progress" errors.
@pytest.fixture(scope="session")
def engine():
    url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/fioeluz")
    engine = create_async_engine(url, echo=False, future=True, poolclass=NullPool)
    yield engine

@pytest.fixture(scope="session", autouse=True)
async def prepare_database(engine):
    async with engine.begin() as conn:
        from domain.models import SQLModel
        await conn.run_sync(SQLModel.metadata.create_all)
    yield

@pytest.fixture(autouse=True)
async def clean_database(engine):
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE magic_links, user_patterns, users, patterns, collections CASCADE;"))

@pytest.fixture
async def session(engine):
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as s:
        yield s

@pytest.fixture
async def client(session):
    async def _get_test_session():
        yield session

    app.dependency_overrides[core.database.get_session] = _get_test_session
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
