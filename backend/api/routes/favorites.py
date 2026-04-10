import uuid
from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_session
from services.favorites import FavoriteService

router = APIRouter(prefix="/v1/favorites", tags=["Favorites"])

@router.post("/{pattern_id}", status_code=status.HTTP_202_ACCEPTED)
async def favorite_pattern(
    pattern_id: uuid.UUID,
    user_id: uuid.UUID, # Usually comes from Auth dependency, simplified here
    session: AsyncSession = Depends(get_session)
):
    # Correção 6: Geração de correlation_id explícita na fronteira
    correlation_id = str(uuid.uuid4())
    
    service = FavoriteService(session)
    result = await service.add_favorite(
        user_id=user_id, 
        pattern_id=pattern_id, 
        correlation_id=correlation_id
    )

    # Correção 7: Retorno Rápido sinalizando continuação ou link para polling
    return result
