from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_session
from domain.schemas import AuthRequest, TokenResponse
from services.auth import AuthService

router = APIRouter(prefix="/v1/auth", tags=["Authentication"])

@router.post("/magic-link", status_code=status.HTTP_200_OK)
async def request_magic_link(
    auth_data: AuthRequest,
    session: AsyncSession = Depends(get_session)
):
    auth_service = AuthService(session)
    user = await auth_service.get_or_create_user(auth_data.email)
    await auth_service.create_magic_link(user.id)
    
    return {"message": "If the email is registered, you will receive a login link (Check logs for simulation)"}

@router.post("/verify", response_model=TokenResponse)
async def verify_token(
    token: str,
    session: AsyncSession = Depends(get_session)
):
    auth_service = AuthService(session)
    user = await auth_service.verify_magic_link(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    access_token = auth_service.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
