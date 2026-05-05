from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

@dataclass
class UserPattern:
    user_id: UUID
    pattern_id: UUID
    status: str = "PROCESSING"
    favorited_at: datetime = field(default_factory=datetime.utcnow)
    synced_offline: bool = False

    def mark_as_done(self):
        """Rich behavior: Transition to DONE state."""
        if self.status == "FAILED":
            # Example invariant: cannot recover from failed automatically without re-processing logic
            pass
        self.status = "DONE"

    def mark_as_failed(self):
        self.status = "FAILED"
