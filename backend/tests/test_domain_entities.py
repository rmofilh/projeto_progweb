import pytest
from uuid import uuid4
from domain.entities.user import User
from domain.entities.pattern import Pattern
from domain.entities.user_pattern import UserPattern

def test_user_can_favorite_limit():
    """Verifies that the business rule for favorite limits is enforced in the entity."""
    user = User(email="rich@domain.com")
    assert user.can_favorite(99) is True
    assert user.can_favorite(100) is False

def test_pattern_difficulty_invariant():
    """Verifies that the entity protects its invariants (fail-fast)."""
    with pytest.raises(ValueError, match="Difficulty level MUST be between 1 and 5"):
        Pattern(
            title="Invalid", 
            image_path="img.png", 
            thumbnail_path="thumb.png", 
            scale_cm_reference=1.0, 
            difficulty_level=6
        )

def test_user_pattern_status_transitions():
    """Verifies state transitions behavior in the entity."""
    up = UserPattern(user_id=uuid4(), pattern_id=uuid4())
    assert up.status == "PROCESSING"
    up.mark_as_done()
    assert up.status == "DONE"
    up.mark_as_failed()
    assert up.status == "FAILED"
