import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends
from ..schemas import PatternResponse, CollectionResponse
from ..dependencies import get_catalog_use_case, get_collections_use_case, get_pattern_by_id_use_case

router = APIRouter(prefix="/v1/catalog", tags=["Catalog"])

@router.get("/patterns", response_model=List[PatternResponse])
async def list_patterns(
    collection_id: Optional[uuid.UUID] = None,
    use_case = Depends(get_catalog_use_case)
):
    return await use_case.execute(collection_id)

@router.get("/patterns/{pattern_id}", response_model=PatternResponse)
async def get_pattern(
    pattern_id: uuid.UUID,
    use_case = Depends(get_pattern_by_id_use_case)
):
    pattern = await use_case.execute(pattern_id)
    if not pattern:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pattern not found")
    return pattern

@router.get("/collections", response_model=List[CollectionResponse])
async def list_collections(
    use_case = Depends(get_collections_use_case)
):
    return await use_case.execute()
