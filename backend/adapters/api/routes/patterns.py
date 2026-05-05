import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends
from ..schemas import PatternResponse, CollectionResponse
from ..dependencies import get_catalog_use_case, get_collections_use_case

router = APIRouter(prefix="/v1/catalog", tags=["Catalog"])

@router.get("/patterns", response_model=List[PatternResponse])
async def list_patterns(
    collection_id: Optional[uuid.UUID] = None,
    use_case = Depends(get_catalog_use_case)
):
    return await use_case.execute(collection_id)

@router.get("/collections", response_model=List[CollectionResponse])
async def list_collections(
    use_case = Depends(get_collections_use_case)
):
    return await use_case.execute()
