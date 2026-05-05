from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

@dataclass
class User:
    email: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None
    
    # Logic behavior
    def can_favorite(self, current_count: int) -> bool:
        """Business Rule: Maximum 100 favorites allowed."""
        return current_count < 100

    def update_last_login(self):
        self.last_login_at = datetime.utcnow()
