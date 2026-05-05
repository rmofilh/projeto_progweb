from uuid import UUID
from datetime import datetime
from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy import func
from sqlmodel.ext.asyncio.session import AsyncSession
from domain.repositories.interfaces import IUserRepository, IPatternRepository, IFavoriteRepository
from use_cases.ports.auth import IMagicLinkRepository
from domain.entities.user import User as DomainUser
from domain.entities.pattern import Pattern as DomainPattern
from domain.entities.collection import Collection as DomainCollection
from domain.entities.user_pattern import UserPattern as DomainUserPattern
from .models import (
    User as ORMUser, 
    Pattern as ORMPattern, 
    Collection as ORMCollection, 
    UserPattern as ORMUserPattern,
    MagicLink as ORMMagicLink,
    CorrelationId as ORMCorrelationId
)
from .mappers import (
    user_to_domain, user_to_orm, 
    pattern_to_domain, collection_to_domain, 
    user_pattern_to_domain, user_pattern_to_orm
)

class SQLUserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID) -> Optional[DomainUser]:
        orm = await self.session.get(ORMUser, user_id)
        return user_to_domain(orm) if orm else None

    async def get_by_email(self, email: str) -> Optional[DomainUser]:
        stmt = select(ORMUser).where(ORMUser.email == email)
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

    async def get_all(self, collection_id: Optional[UUID] = None) -> List[DomainPattern]:
        stmt = select(ORMPattern)
        if collection_id:
            stmt = stmt.where(ORMPattern.collection_id == collection_id)
        result = await self.session.execute(stmt)
        return [pattern_to_domain(p) for p in result.scalars().all()]

    async def get_by_id(self, pattern_id: UUID) -> Optional[DomainPattern]:
        orm = await self.session.get(ORMPattern, pattern_id)
        return pattern_to_domain(orm) if orm else None

    async def get_collections(self) -> List[DomainCollection]:
        stmt = select(ORMCollection)
        result = await self.session.execute(stmt)
        return [collection_to_domain(c) for c in result.scalars().all()]

class SQLFavoriteRepository(IFavoriteRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_count_for_user(self, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(ORMUserPattern).where(ORMUserPattern.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def get_by_user_and_pattern(self, user_id: UUID, pattern_id: UUID) -> Optional[DomainUserPattern]:
        stmt = select(ORMUserPattern).where(
            ORMUserPattern.user_id == user_id, 
            ORMUserPattern.pattern_id == pattern_id
        )
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_pattern_to_domain(orm) if orm else None

    async def add(self, favorite: DomainUserPattern) -> None:
        orm = user_pattern_to_orm(favorite)
        self.session.add(orm)
        await self.session.flush()

    async def update(self, favorite: DomainUserPattern) -> None:
        # Composite primary key for UserPattern is user_id + pattern_id
        stmt = select(ORMUserPattern).where(
            ORMUserPattern.user_id == favorite.user_id,
            ORMUserPattern.pattern_id == favorite.pattern_id
        )
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        if orm:
            orm.status = favorite.status
            orm.synced_offline = favorite.synced_offline
            self.session.add(orm)
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

    async def get_valid_user_id(self, token: str) -> Optional[UUID]:
        stmt = select(ORMMagicLink).where(
            ORMMagicLink.token == token, 
            ORMMagicLink.used == False,
            ORMMagicLink.expires_at > datetime.utcnow()
        )
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        return orm.user_id if orm else None

    async def mark_as_used(self, token: str) -> None:
        stmt = select(ORMMagicLink).where(ORMMagicLink.token == token)
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        if orm:
            orm.used = True
            self.session.add(orm)
            await self.session.flush()
