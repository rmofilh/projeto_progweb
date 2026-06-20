from datetime import datetime
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.future import select
from sqlmodel.ext.asyncio.session import AsyncSession

from domain.entities.collection import Collection as DomainCollection
from domain.entities.pattern import Pattern as DomainPattern
from domain.entities.user import User as DomainUser
from domain.entities.user_pattern import UserPattern as DomainUserPattern
from domain.repositories.interfaces import IFavoriteRepository, IPatternRepository, IUserRepository
from use_cases.ports.auth import IMagicLinkRepository

from .mappers import (
    collection_to_domain,
    pattern_to_domain,
    user_pattern_to_domain,
    user_pattern_to_orm,
    user_to_domain,
    user_to_orm,
)
from .models import Collection as ORMCollection
from .models import CorrelationId as ORMCorrelationId
from .models import MagicLink as ORMMagicLink
from .models import Pattern as ORMPattern
from .models import User as ORMUser
from .models import UserPattern as ORMUserPattern


class SQLUserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID) -> DomainUser | None:
        orm = await self.session.get(ORMUser, user_id)
        return user_to_domain(orm) if orm else None

    async def get_by_email(self, email: str) -> DomainUser | None:
        stmt = select(ORMUser).where(ORMUser.email == email)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_to_domain(orm) if orm else None

    async def add(self, user: DomainUser) -> None:
        orm = user_to_orm(user)
        self.session.add(orm)
        # Flush but NO commit - boundary is in API
        await self.session.flush()

    async def update(self, user: DomainUser) -> None:
        orm = await self.session.get(ORMUser, user.id)
        if orm:
            orm.email = user.email
            orm.last_login_at = user.last_login_at
            self.session.add(orm)
            await self.session.flush()


class SQLPatternRepository(IPatternRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, collection_id: UUID | None = None) -> list[DomainPattern]:
        stmt = select(ORMPattern)
        if collection_id:
            stmt = stmt.where(ORMPattern.collection_id == collection_id)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        return [pattern_to_domain(p) for p in result.scalars().all()]

    async def get_by_id(self, pattern_id: UUID) -> DomainPattern | None:
        orm = await self.session.get(ORMPattern, pattern_id)
        return pattern_to_domain(orm) if orm else None

    async def get_collections(self) -> list[DomainCollection]:
        stmt = select(ORMCollection)
        result = await self.session.execute(stmt)
        return [collection_to_domain(c) for c in result.scalars().all()]


class SQLFavoriteRepository(IFavoriteRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_count_for_user(self, user_id: UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(ORMUserPattern)
            .where(ORMUserPattern.user_id == user_id)  # type: ignore[arg-type]
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def get_by_user_and_pattern(
        self, user_id: UUID, pattern_id: UUID
    ) -> DomainUserPattern | None:
        user_id_expr = ORMUserPattern.user_id == user_id
        pattern_id_expr = ORMUserPattern.pattern_id == pattern_id
        stmt = select(ORMUserPattern).where(user_id_expr, pattern_id_expr)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_pattern_to_domain(orm) if orm else None

    async def add(self, favorite: DomainUserPattern) -> None:
        orm = user_pattern_to_orm(favorite)
        self.session.add(orm)
        await self.session.flush()

    async def update(self, favorite: DomainUserPattern) -> None:
        # Composite primary key for UserPattern is user_id + pattern_id
        user_id_expr = ORMUserPattern.user_id == favorite.user_id
        pattern_id_expr = ORMUserPattern.pattern_id == favorite.pattern_id
        stmt = select(ORMUserPattern).where(user_id_expr, pattern_id_expr)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        if orm:
            orm.status = favorite.status
            orm.synced_offline = favorite.synced_offline
            self.session.add(orm)
            await self.session.flush()

    async def get_by_user(self, user_id: UUID) -> list[DomainUserPattern]:
        stmt = select(ORMUserPattern).where(ORMUserPattern.user_id == user_id)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        return [user_pattern_to_domain(up) for up in result.scalars().all()]

    async def delete(self, user_id: UUID, pattern_id: UUID) -> None:
        user_id_expr = ORMUserPattern.user_id == user_id
        pattern_id_expr = ORMUserPattern.pattern_id == pattern_id
        stmt = select(ORMUserPattern).where(user_id_expr, pattern_id_expr)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        if orm:
            await self.session.delete(orm)
            await self.session.flush()

    async def exists_correlation_id(self, correlation_id: str) -> bool:
        orm = await self.session.get(ORMCorrelationId, correlation_id)
        return orm is not None

    async def register_correlation_id(self, correlation_id: str) -> None:
        orm = ORMCorrelationId(id=correlation_id)
        self.session.add(orm)
        await self.session.flush()


class SQLMagicLinkRepository(IMagicLinkRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, user_id: UUID, token: str, expires_at: datetime) -> None:
        orm = ORMMagicLink(user_id=user_id, token=token, expires_at=expires_at)
        self.session.add(orm)
        await self.session.flush()

    async def get_valid_user_id(self, token: str) -> UUID | None:
        token_expr = ORMMagicLink.token == token
        used_expr = ORMMagicLink.used == False  # noqa: E712 — SQLAlchemy overloads == for column expressions
        expires_expr = ORMMagicLink.expires_at > datetime.utcnow()
        stmt = select(ORMMagicLink).where(token_expr, used_expr, expires_expr)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        return orm.user_id if orm else None

    async def mark_as_used(self, token: str) -> None:
        stmt = select(ORMMagicLink).where(ORMMagicLink.token == token)  # type: ignore[arg-type]
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        if orm:
            orm.used = True
            self.session.add(orm)
            await self.session.flush()
