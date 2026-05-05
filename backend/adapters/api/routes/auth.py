from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from infrastructure.database import get_session
from ..schemas import AuthRequest, TokenResponse
from ..dependencies import get_request_magic_link_use_case, get_verify_magic_link_use_case

router = APIRouter(prefix="/v1/auth", tags=["Authentication"])

@router.post("/magic-link", status_code=status.HTTP_200_OK)
async def request_magic_link(
    auth_data: AuthRequest,
    use_case = Depends(get_request_magic_link_use_case),
    session: AsyncSession = Depends(get_session)
):
    await use_case.execute(auth_data.email)
    # Transactional boundary: API layer commits the result of the entire use case
    await session.commit()
    
    return {"message": "If the email is registered, you will receive a login link (Check logs for simulation)"}

@router.post("/verify", response_model=TokenResponse)
async def verify_token(
    token: str,
    use_case = Depends(get_verify_magic_link_use_case),
    session: AsyncSession = Depends(get_session)
):
    access_token = await use_case.execute(token)
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Transactional boundary: Final commit for user login metadata update
    await session.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}
