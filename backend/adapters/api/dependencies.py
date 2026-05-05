from fastapi import Depends, HTTPException, status, security
from jose import jwt, JWTError
from sqlmodel.ext.asyncio.session import AsyncSession
from infrastructure.database import get_session
from adapters.persistence.sqlmodel.repositories import (
    SQLUserRepository, SQLPatternRepository, SQLFavoriteRepository, SQLMagicLinkRepository
)
from infrastructure.auth import JWTTokenProvider, SECRET_KEY, ALGORITHM
from infrastructure.messaging import broker
from use_cases.auth.login import RequestMagicLinkUseCase, VerifyMagicLinkUseCase
from use_cases.favorites.add_favorite import AddFavoriteUseCase
from use_cases.patterns.get_patterns import GetCatalogUseCase, GetCollectionsUseCase
from domain.entities.user import User as DomainUser

reusable_oauth2 = security.OAuth2PasswordBearer(tokenUrl="/v1/auth/verify")

# Repositories
async def get_user_repo(session: AsyncSession = Depends(get_session)):
    return SQLUserRepository(session)

async def get_pattern_repo(session: AsyncSession = Depends(get_session)):
    return SQLPatternRepository(session)

async def get_favorite_repo(session: AsyncSession = Depends(get_session)):
    return SQLFavoriteRepository(session)

async def get_magic_link_repo(session: AsyncSession = Depends(get_session)):
    return SQLMagicLinkRepository(session)

# Infrastructure
def get_token_provider():
    return JWTTokenProvider()

def get_messaging_broker():
    return broker

# Use Cases
def get_request_magic_link_use_case(
    user_repo = Depends(get_user_repo),
    magic_link_repo = Depends(get_magic_link_repo)
):
    return RequestMagicLinkUseCase(user_repo, magic_link_repo)

def get_verify_magic_link_use_case(
    user_repo = Depends(get_user_repo),
    magic_link_repo = Depends(get_magic_link_repo),
    token_provider = Depends(get_token_provider)
):
    return VerifyMagicLinkUseCase(user_repo, magic_link_repo, token_provider)

def get_add_favorite_use_case(
    favorite_repo = Depends(get_favorite_repo),
    user_repo = Depends(get_user_repo),
    messaging = Depends(get_messaging_broker)
):
    return AddFavoriteUseCase(favorite_repo, user_repo, messaging)

def get_catalog_use_case(repo = Depends(get_pattern_repo)):
    return GetCatalogUseCase(repo)

def get_collections_use_case(repo = Depends(get_pattern_repo)):
    return GetCollectionsUseCase(repo)

# Auth Dependency
async def get_current_user(
    token: str = Depends(reusable_oauth2),
    user_repo = Depends(get_user_repo)
) -> DomainUser:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    user = await user_repo.get_by_email(email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return user
