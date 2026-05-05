try:
    from typing import Protocol
except ImportError:
    from typing_extensions import Protocol
from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID

class IMagicLinkRepository(Protocol):
    async def add(self, user_id: UUID, token: str, expires_at: datetime) -> None: ...
    async def get_valid_user_id(self, token: str) -> Optional[UUID]: ...
    async def mark_as_used(self, token: str) -> None: ...

class ITokenProvider(Protocol):
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str: ...
