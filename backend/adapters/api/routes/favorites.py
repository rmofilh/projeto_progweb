import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from infrastructure.database import get_session
from ..dependencies import get_add_favorite_use_case, get_current_user
from domain.entities.user import User as DomainUser
from domain.exceptions.base import LimitReachedException, EntityNotFoundException

router = APIRouter(prefix="/v1/favorites", tags=["Favorites"])

@router.post("/{pattern_id}", status_code=status.HTTP_202_ACCEPTED)
async def favorite_pattern(
    pattern_id: uuid.UUID,
    current_user: DomainUser = Depends(get_current_user),
    use_case = Depends(get_add_favorite_use_case),
    session: AsyncSession = Depends(get_session)
):
    correlation_id = str(uuid.uuid4())
    
    try:
        result = await use_case.execute(
            user_id=current_user.id, 
            pattern_id=pattern_id, 
            correlation_id=correlation_id
        )
        
        # Transactional boundary: Commit the favorite registration (Outbox)
        await session.commit()
        return result

    except LimitReachedException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal error occurred")
