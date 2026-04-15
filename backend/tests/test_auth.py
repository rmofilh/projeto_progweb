import pytest
from domain.models import User, MagicLink
from datetime import datetime, timedelta
from sqlalchemy.future import select

@pytest.mark.asyncio
async def test_request_magic_link_new_user(client, session):
    # Solicita link para novo e-mail
    email = "test@example.com"
    response = await client.post("/v1/auth/magic-link", json={"email": email})
    
    assert response.status_code == 200
    assert "Check logs for simulation" in response.json()["message"]
    
    # Verifica se usuário foi criado
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    assert user is not None
    
    # Verifica se link foi gerado
    statement = select(MagicLink).where(MagicLink.user_id == user.id)
    result = await session.execute(statement)
    link = result.scalar_one_or_none()
    assert link is not None

@pytest.mark.asyncio
async def test_verify_magic_link_success(client, session):
    # Setup: Cria usuário e link
    user = User(email="success@example.com")
    session.add(user)
    await session.commit()
    
    token = "valid-token"
    link = MagicLink(user_id=user.id, token=token, expires_at=datetime.utcnow() + timedelta(minutes=15))
    session.add(link)
    await session.commit()
    
    # Execução
    response = await client.post(f"/v1/auth/verify?token={token}")
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_verify_magic_link_expired(client, session):
    # Setup: Link expirado
    user = User(email="expired@example.com")
    session.add(user)
    await session.commit()
    
    token = "old-token"
    link = MagicLink(user_id=user.id, token=token, expires_at=datetime.utcnow() - timedelta(minutes=1))
    session.add(link)
    await session.commit()
    
    # Execução
    response = await client.post(f"/v1/auth/verify?token={token}")
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"

@pytest.mark.asyncio
async def test_verify_magic_link_invalid(client):
    # Execução com token inexistente
    response = await client.post("/v1/auth/verify?token=non-existent")
    
    assert response.status_code == 401
