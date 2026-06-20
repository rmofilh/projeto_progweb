import os

import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlmodel.ext.asyncio.session import AsyncSession

from adapters.persistence.sqlmodel.models import SQLModel
from infrastructure.database import get_session
from main import app


@pytest.fixture(scope="session")
def engine():
    url = os.getenv(
        "DATABASE_URL", "postgresql+asyncpg://fioeluz:fioeluz_pass@localhost:5432/fioeluz_test_db"
    )
    engine = create_async_engine(url, echo=False, future=True, poolclass=NullPool)
    yield engine


@pytest.fixture(scope="session", autouse=True)
async def prepare_database(engine):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield


@pytest.fixture(autouse=True)
async def clean_database(engine):
    async with engine.begin() as conn:
        # Include correlation_ids in truncation
        await conn.execute(
            text(
                "TRUNCATE magic_links, user_patterns, users, patterns, "
                "collections, correlation_ids CASCADE;"
            )
        )


@pytest.fixture
async def session(engine):
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as s:
        yield s


@pytest.fixture
async def client(session):
    async def _get_test_session():
        yield session

    app.dependency_overrides[get_session] = _get_test_session
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
