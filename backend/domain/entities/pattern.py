from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

@dataclass
class Pattern:
    title: str
    image_path: str
    thumbnail_path: str
    scale_cm_reference: float
    difficulty_level: int
    id: UUID = field(default_factory=uuid4)
    collection_id: Optional[UUID] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        # Invariant Fail-fast check
        if not (1 <= self.difficulty_level <= 5):
            raise ValueError("Difficulty level MUST be between 1 and 5")
