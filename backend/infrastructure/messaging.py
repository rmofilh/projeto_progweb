import datetime
import json
import logging
from typing import Any

from use_cases.ports.messaging import IMessagingProtocol

logger = logging.getLogger(__name__)


class MockMessageBroker(IMessagingProtocol):
    async def publish(self, topic: str, payload: Any, correlation_id: str) -> None:
        """Concrete implementation of the messaging port."""
        envelope = {
            "correlation_id": correlation_id,
            "metadata": {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "topic": topic,
                "environment": "development-mock",
            },
            "data": payload,
        }

        log_msg = json.dumps(envelope, indent=2)
        logger.info("Dispatching to %s:\n%s", topic, log_msg)


broker = MockMessageBroker()
