import pytest
from domain.models import Pattern, Collection
import uuid

@pytest.mark.asyncio
async def test_list_patterns_empty(client):
    response = await client.get("/v1/patterns")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_list_patterns_with_data(client, session):
    # Setup
    col = Collection(title="Summer", cover_image_path="img.png")
    session.add(col)
    await session.commit()
    await session.refresh(col)
    
    pat1 = Pattern(
        title="Bikini", image_path="p1.png", thumbnail_path="t1.png",
        scale_cm_reference=10.0, difficulty_level=3, collection_id=col.id
    )
    pat2 = Pattern(
        title="Hat", image_path="p2.png", thumbnail_path="t2.png",
        scale_cm_reference=5.0, difficulty_level=1
    )
    session.add(pat1)
    session.add(pat2)
    await session.commit()
    
    # Execução: Listar todos
    response = await client.get("/v1/patterns")
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Execução: Filtrar por coleção
    response = await client.get(f"/v1/patterns?collection_id={col.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Bikini"

@pytest.mark.asyncio
async def test_get_pattern_by_id(client, session):
    pat = Pattern(
        title="Special", image_path="p.png", thumbnail_path="t.png",
        scale_cm_reference=1.0, difficulty_level=5
    )
    session.add(pat)
    await session.commit()
    await session.refresh(pat)
    
    response = await client.get(f"/v1/patterns/{pat.id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Special"
    
    # Not found
    response = await client.get(f"/v1/patterns/{uuid.uuid4()}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_list_collections(client, session):
    session.add(Collection(title="Winter", cover_image_path="w.png"))
    await session.commit()
    
    response = await client.get("/v1/collections")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Winter"
