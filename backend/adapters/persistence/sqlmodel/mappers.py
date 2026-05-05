from domain.entities.user import User as DomainUser
from domain.entities.pattern import Pattern as DomainPattern
from domain.entities.collection import Collection as DomainCollection
from domain.entities.user_pattern import UserPattern as DomainUserPattern
from .models import (
    User as ORMUser, 
    Pattern as ORMPattern, 
    Collection as ORMCollection, 
    UserPattern as ORMUserPattern
)

def user_to_domain(orm: ORMUser) -> DomainUser:
    return DomainUser(
        id=orm.id,
        email=orm.email,
        created_at=orm.created_at,
        last_login_at=orm.last_login_at
    )

def user_to_orm(domain: DomainUser) -> ORMUser:
    return ORMUser(
        id=domain.id,
        email=domain.email,
        created_at=domain.created_at,
        last_login_at=domain.last_login_at
    )

def pattern_to_domain(orm: ORMPattern) -> DomainPattern:
    return DomainPattern(
        id=orm.id,
        title=orm.title,
        image_path=orm.image_path,
        thumbnail_path=orm.thumbnail_path,
        scale_cm_reference=orm.scale_cm_reference,
        difficulty_level=orm.difficulty_level,
        collection_id=orm.collection_id,
        created_at=orm.created_at
    )

def collection_to_domain(orm: ORMCollection) -> DomainCollection:
    return DomainCollection(
        id=orm.id,
        title=orm.title,
        cover_image_path=orm.cover_image_path,
        created_at=orm.created_at
    )

def user_pattern_to_domain(orm: ORMUserPattern) -> DomainUserPattern:
    return DomainUserPattern(
        user_id=orm.user_id,
        pattern_id=orm.pattern_id,
        status=orm.status,
        favorited_at=orm.favorited_at,
        synced_offline=orm.synced_offline
    )

def user_pattern_to_orm(domain: DomainUserPattern) -> ORMUserPattern:
    return ORMUserPattern(
        user_id=domain.user_id,
        pattern_id=domain.pattern_id,
        status=domain.status,
        favorited_at=domain.favorited_at,
        synced_offline=domain.synced_offline
    )
