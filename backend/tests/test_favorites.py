import pytest
from adapters.persistence.sqlmodel.models import User, Pattern, UserPattern
from sqlalchemy.future import select
import uuid
from adapters.api.dependencies import get_current_user
from main import app
from datetime import datetime

@pytest.fixture
async def authenticated_client(client, session):
    # Setup: Criar usuário real no banco
    user = User(email="active@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Override do dependency injection para retornar este usuário
    async def _get_current_user():
        return user
    
    app.dependency_overrides[get_current_user] = _get_current_user
    yield client
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_add_favorite_success(authenticated_client, session):
    # Setup: Criar um pattern
    pat = Pattern(
        title="Bikini", image_path="p1.png", thumbnail_path="t1.png",
        scale_cm_reference=10.0, difficulty_level=3
    )
    session.add(pat)
    await session.commit()
    await session.refresh(pat)
    
    # Execução
    response = await authenticated_client.post(f"/v1/favorites/{pat.id}")
    
    assert response.status_code == 202
    assert response.json()["status"] == "processing"
    
    # Verifica persistência (Outbox) - Corrigido para AsyncSession
    statement = select(UserPattern).where(UserPattern.pattern_id == pat.id)
    res = await session.execute(statement)
    up = res.scalar_one_or_none()
    assert up is not None
    assert up.status == "PROCESSING"

@pytest.mark.asyncio
async def test_add_favorite_idempotency(authenticated_client, session):
    # Setup: Buscar o usuário injetado (via mock override)
    # Como injetamos _get_current_user, pegamos o user criado no banco
    statement = select(User).where(User.email == "active@example.com")
    res = await session.execute(statement)
    user = res.scalar_one()
    
    pat = Pattern(title="Repeat", image_path="p.png", thumbnail_path="t.png", scale_cm_reference=1.0, difficulty_level=1)
    session.add(pat)
    await session.commit()
    await session.refresh(pat)
    
    up = UserPattern(user_id=user.id, pattern_id=pat.id, status="DONE")
    session.add(up)
    await session.commit()
    
    # Execução: Favoritar de novo
    response = await authenticated_client.post(f"/v1/favorites/{pat.id}")
    
    assert response.status_code == 202
    assert response.json()["status"] == "already_favorited"

@pytest.mark.asyncio
async def test_add_favorite_limit(authenticated_client, session):
    # Setup: Buscar o usuário injetado
    statement = select(User).where(User.email == "active@example.com")
    res = await session.execute(statement)
    user = res.scalar_one()

    # Inserir 100 favoritos reais para satisfazer FK e limites
    for i in range(100):
        p = Pattern(title=f"P{i}", image_path="i", thumbnail_path="t", scale_cm_reference=1, difficulty_level=1)
        session.add(p)
    await session.commit()
    
    # Agora buscamos os IDs criados para vincular ao usuário
    res = await session.execute(select(Pattern.id))
    p_ids = res.scalars().all()
    
    for p_id in p_ids:
        up = UserPattern(user_id=user.id, pattern_id=p_id)
        session.add(up)
    await session.commit()
    
    # Novo pattern para tentar favoritar (101º)
    p_last = Pattern(title="Last", image_path="i", thumbnail_path="t", scale_cm_reference=1, difficulty_level=1)
    session.add(p_last)
    await session.commit()
    await session.refresh(p_last)
    
    response = await authenticated_client.post(f"/v1/favorites/{p_last.id}")
    assert response.status_code == 400
    assert "Limite" in response.json()["detail"]

# --- Remove Favorites ---

@pytest.mark.asyncio
async def test_remove_favorite_success(authenticated_client, session):
    # Setup
    statement = select(User).where(User.email == "active@example.com")
    res = await session.execute(statement)
    user = res.scalar_one()

    pat = Pattern(title="ToRemove", image_path="p.png", thumbnail_path="t.png", scale_cm_reference=1.0, difficulty_level=1)
    session.add(pat)
    await session.commit()
    await session.refresh(pat)

    up = UserPattern(user_id=user.id, pattern_id=pat.id, status="DONE")
    session.add(up)
    await session.commit()

    # Execution
    response = await authenticated_client.delete(f"/v1/favorites/{pat.id}")

    assert response.status_code == 200
    assert response.json()["status"] == "removed"

    # Verify deletion
    stmt = select(UserPattern).where(UserPattern.pattern_id == pat.id)
    res = await session.execute(stmt)
    assert res.scalar_one_or_none() is None

@pytest.mark.asyncio
async def test_remove_favorite_not_found(authenticated_client):
    fake_id = uuid.uuid4()
    response = await authenticated_client.delete(f"/v1/favorites/{fake_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

# --- List Favorites ---

@pytest.mark.asyncio
async def test_list_favorites_empty(authenticated_client):
    response = await authenticated_client.get("/v1/favorites")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_list_favorites_with_data(authenticated_client, session):
    # Setup
    statement = select(User).where(User.email == "active@example.com")
    res = await session.execute(statement)
    user = res.scalar_one()

    pat1 = Pattern(title="Fav1", image_path="p1.png", thumbnail_path="t1.png", scale_cm_reference=10.0, difficulty_level=2)
    pat2 = Pattern(title="Fav2", image_path="p2.png", thumbnail_path="t2.png", scale_cm_reference=5.0, difficulty_level=3)
    session.add(pat1)
    session.add(pat2)
    await session.commit()
    await session.refresh(pat1)
    await session.refresh(pat2)

    up1 = UserPattern(user_id=user.id, pattern_id=pat1.id, status="DONE")
    up2 = UserPattern(user_id=user.id, pattern_id=pat2.id, status="DONE")
    session.add(up1)
    session.add(up2)
    await session.commit()

    # Execution
    response = await authenticated_client.get("/v1/favorites")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    titles = [p["title"] for p in data]
    assert "Fav1" in titles
    assert "Fav2" in titles
