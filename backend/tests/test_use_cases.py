from unittest.mock import ANY, AsyncMock, MagicMock
from uuid import uuid4

import pytest

from domain.entities.pattern import Pattern
from domain.entities.user import User
from domain.entities.user_pattern import UserPattern
from domain.exceptions.base import EntityNotFoundException, LimitReachedException
from use_cases.auth.login import RequestMagicLinkUseCase, VerifyMagicLinkUseCase
from use_cases.favorites.add_favorite import AddFavoriteUseCase
from use_cases.favorites.list_favorites import ListFavoritesUseCase
from use_cases.favorites.remove_favorite import RemoveFavoriteUseCase


class TestAddFavoriteUseCase:
    async def test_already_processed(self):
        fav_repo = AsyncMock()
        fav_repo.exists_correlation_id.return_value = True
        uc = AddFavoriteUseCase(fav_repo, AsyncMock(), AsyncMock())
        result = await uc.execute(uuid4(), uuid4(), "cid")
        assert result == {"status": "already_processed", "correlation_id": "cid"}

    async def test_user_not_found(self):
        fav_repo = AsyncMock()
        fav_repo.exists_correlation_id.return_value = False
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None
        uc = AddFavoriteUseCase(fav_repo, user_repo, AsyncMock())
        with pytest.raises(EntityNotFoundException):
            await uc.execute(uuid4(), uuid4(), "cid")

    async def test_limit_exceeded(self):
        fav_repo = AsyncMock()
        fav_repo.exists_correlation_id.return_value = False
        fav_repo.get_count_for_user.return_value = 100
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = User(email="test@test.com")
        uc = AddFavoriteUseCase(fav_repo, user_repo, AsyncMock())
        with pytest.raises(LimitReachedException, match="100 favoritos"):
            await uc.execute(uuid4(), uuid4(), "cid")

    async def test_already_favorited(self):
        user_id = uuid4()
        pattern_id = uuid4()
        fav_repo = AsyncMock()
        fav_repo.exists_correlation_id.return_value = False
        fav_repo.get_count_for_user.return_value = 0
        fav_repo.get_by_user_and_pattern.return_value = UserPattern(
            user_id=user_id, pattern_id=pattern_id
        )
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = User(email="test@test.com")
        uc = AddFavoriteUseCase(fav_repo, user_repo, AsyncMock())
        result = await uc.execute(user_id, pattern_id, "cid")
        assert result == {"status": "already_favorited", "correlation_id": "cid"}
        fav_repo.register_correlation_id.assert_awaited_once_with("cid")

    async def test_success(self):
        user_id = uuid4()
        pattern_id = uuid4()
        fav_repo = AsyncMock()
        fav_repo.exists_correlation_id.return_value = False
        fav_repo.get_count_for_user.return_value = 5
        fav_repo.get_by_user_and_pattern.return_value = None
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = User(email="test@test.com")
        messaging = AsyncMock()
        uc = AddFavoriteUseCase(fav_repo, user_repo, messaging)
        result = await uc.execute(user_id, pattern_id, "cid")
        assert result == {"status": "processing", "correlation_id": "cid"}
        fav_repo.add.assert_awaited_once()
        fav_repo.register_correlation_id.assert_awaited_once_with("cid")
        messaging.publish.assert_awaited_once_with(
            topic="favorites_queue",
            payload={"user_id": str(user_id), "pattern_id": str(pattern_id)},
            correlation_id="cid",
        )


class TestRemoveFavoriteUseCase:
    async def test_not_found(self):
        fav_repo = AsyncMock()
        fav_repo.get_by_user_and_pattern.return_value = None
        uc = RemoveFavoriteUseCase(fav_repo)
        with pytest.raises(EntityNotFoundException):
            await uc.execute(uuid4(), uuid4())

    async def test_success(self):
        user_id = uuid4()
        pattern_id = uuid4()
        fav_repo = AsyncMock()
        fav_repo.get_by_user_and_pattern.return_value = UserPattern(
            user_id=user_id, pattern_id=pattern_id
        )
        uc = RemoveFavoriteUseCase(fav_repo)
        result = await uc.execute(user_id, pattern_id)
        assert result == {"status": "removed"}
        fav_repo.delete.assert_awaited_once_with(user_id, pattern_id)


class TestListFavoritesUseCase:
    async def test_empty(self):
        fav_repo = AsyncMock()
        fav_repo.get_by_user.return_value = []
        uc = ListFavoritesUseCase(fav_repo, AsyncMock())
        result = await uc.execute(uuid4())
        assert result == []

    async def test_with_data(self):
        user_id = uuid4()
        pattern_id = uuid4()
        pattern = Pattern(
            title="Test Pattern",
            image_path="i.png",
            thumbnail_path="t.png",
            scale_cm_reference=1.0,
            difficulty_level=1,
        )
        fav_repo = AsyncMock()
        fav_repo.get_by_user.return_value = [UserPattern(user_id=user_id, pattern_id=pattern_id)]
        pattern_repo = AsyncMock()
        pattern_repo.get_by_id.return_value = pattern
        uc = ListFavoritesUseCase(fav_repo, pattern_repo)
        result = await uc.execute(user_id)
        assert len(result) == 1
        assert result[0].title == "Test Pattern"

    async def test_skips_missing_pattern(self):
        fav_repo = AsyncMock()
        fav_repo.get_by_user.return_value = [UserPattern(user_id=uuid4(), pattern_id=uuid4())]
        pattern_repo = AsyncMock()
        pattern_repo.get_by_id.return_value = None
        uc = ListFavoritesUseCase(fav_repo, pattern_repo)
        result = await uc.execute(uuid4())
        assert result == []


class TestRequestMagicLinkUseCase:
    async def test_new_user(self):
        user_repo = AsyncMock()
        user_repo.get_by_email.return_value = None
        magic_link_repo = AsyncMock()
        uc = RequestMagicLinkUseCase(user_repo, magic_link_repo)
        token = await uc.execute("new@test.com")
        assert isinstance(token, str) and len(token) > 0
        user_repo.add.assert_awaited_once()
        created_user = user_repo.add.call_args[0][0]
        assert isinstance(created_user, User)
        assert created_user.email == "new@test.com"
        magic_link_repo.add.assert_awaited_once_with(created_user.id, token, ANY)

    async def test_existing_user(self):
        existing = User(email="existing@test.com")
        user_repo = AsyncMock()
        user_repo.get_by_email.return_value = existing
        magic_link_repo = AsyncMock()
        uc = RequestMagicLinkUseCase(user_repo, magic_link_repo)
        token = await uc.execute("existing@test.com")
        assert isinstance(token, str) and len(token) > 0
        user_repo.add.assert_not_called()
        magic_link_repo.add.assert_awaited_once_with(existing.id, token, ANY)


class TestVerifyMagicLinkUseCase:
    async def test_invalid_token(self):
        magic_link_repo = AsyncMock()
        magic_link_repo.get_valid_user_id.return_value = None
        uc = VerifyMagicLinkUseCase(AsyncMock(), magic_link_repo, MagicMock())
        result = await uc.execute("invalid")
        assert result is None

    async def test_user_not_found(self):
        user_id = uuid4()
        magic_link_repo = AsyncMock()
        magic_link_repo.get_valid_user_id.return_value = user_id
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None
        uc = VerifyMagicLinkUseCase(user_repo, magic_link_repo, MagicMock())
        result = await uc.execute("valid-token")
        assert result is None

    async def test_success(self):
        user = User(email="success@test.com")
        magic_link_repo = AsyncMock()
        magic_link_repo.get_valid_user_id.return_value = user.id
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        token_provider = MagicMock()
        token_provider.create_access_token.return_value = "jwt-token"
        uc = VerifyMagicLinkUseCase(user_repo, magic_link_repo, token_provider)
        result = await uc.execute("valid-token")
        assert result == "jwt-token"
        user_repo.update.assert_awaited_once()
        magic_link_repo.mark_as_used.assert_awaited_once_with("valid-token")
        token_provider.create_access_token.assert_called_once_with(data={"sub": user.email})
