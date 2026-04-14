import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_session
from domain.schemas import PatternResponse, CollectionResponse
from services.patterns import PatternService

router = APIRouter(tags=["Catalog"])

@router.get("/v1/patterns", response_model=List[PatternResponse])
async def list_patterns(
    collection_id: Optional[uuid.UUID] = None,
    session: AsyncSession = Depends(get_session)
):
    service = PatternService(session)
    return await service.get_all_patterns(collection_id=collection_id)

@router.get("/v1/patterns/{pattern_id}", response_model=PatternResponse)
async def get_pattern(
    pattern_id: uuid.UUID,
    session: AsyncSession = Depends(get_session)
):
    service = PatternService(session)
    pattern = await service.get_pattern_by_id(pattern_id)
    if not pattern:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pattern not found")
    return pattern

@router.get("/v1/collections", response_model=List[CollectionResponse])
async def list_collections(
    session: AsyncSession = Depends(get_session)
):
    service = PatternService(session)
    return await service.get_all_collections()
