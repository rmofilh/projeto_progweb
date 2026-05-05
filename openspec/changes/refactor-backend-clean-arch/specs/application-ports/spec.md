## ADDED Requirements

### Requirement: Application Port for External Services
External services (such as messaging, email, or third-party APIs) SHALL be Accessed via Protocols (Ports) defined strictly in the application layer (`use_cases/ports/`).

#### Scenario: Messaging decoupling
- **WHEN** a Use Case needs to publish a domain event or message
- **THEN** it SHALL call a Port interface, ensuring the core application and domain remain unaware of the concrete messaging implementation (e.g., Redis, RabbitMQ).

### Requirement: Persistence-Based Idempotency
Use Cases SHALL ensure idempotency of operations using persistent storage rather than in-memory mechanisms.

#### Scenario: Idempotency enforcement
- **WHEN** a Use Case receives a request with a duplicate `correlation_id`
- **THEN** it SHALL check the persistent repository for the existing ID and return the previous result or ignore the request, preventing duplicate side effects.
