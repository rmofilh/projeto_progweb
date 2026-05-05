import json
import datetime
from typing import Any
from use_cases.ports.messaging import IMessagingProtocol

class MockMessageBroker(IMessagingProtocol):
    async def publish(self, topic: str, payload: Any, correlation_id: str) -> None:
        """Concrete implementation of the messaging port."""
        envelope = {
            "correlation_id": correlation_id,
            "metadata": {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "topic": topic,
                "environment": "development-mock"
            },
            "data": payload
        }
        
        log_msg = json.dumps(envelope, indent=2)
        print(f"\n[INFRA BROKER MOCK] Dispatching to {topic}:\n{log_msg}\n")
