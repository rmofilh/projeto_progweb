try:
    from typing import Protocol
except ImportError:
    from typing_extensions import Protocol
from typing import Any

class IMessagingProtocol(Protocol):
    async def publish(self, topic: str, payload: Any, correlation_id: str) -> None:
        """
        Application Port for external messaging.
        Enables the core to trigger asynchronous events without coupling to concrete implementations.
        """
        ...
