## Context

The backend is being refactored to eliminate logic leakage and anemic models. The goal is to move all business invariants into pure domain entities and ensure that adapters and use cases are purely technical/orchestration layers.

## Goals / Non-Goals

**Goals:**
- **Zero Logic Leakage**: Enforce that business rules ONLY exist in entities.
- **Rich Domain Isolation**: Domain layer MUST NOT import frameworks or know about infrastructure (including messaging).
- **ORM Isolation**: Prevent ORM models from crossing the persistence layer boundary.
- **Atomic Transactions**: Commit MUST happen ONLY in `adapters/api`.

## Decisions

- **Domain Entity Implementation**: Entities will be POPOs (Plain Old Python Objects). They MUST contain behavior (logic) and invariants.
- **ORM Boundary**: Repositories MUST implementation `_to_entity` conversion and return only domain entities. ORM models (SQLModel) NEVER leave the persistence layer.
- **Messaging Port**: A messaging Protocol MUST be defined in `use_cases/ports/` (Application Layer). This ensures the Domain is pure and decoupled from infrastructure details.
- **Idempotency**: Implemented in Use Cases using persistence-based storage (e.g., repository check for `correlation_id`). In-memory idempotency is forbidden.
- **Transaction Boundary**: The `adapters/api` layer (Controllers) is the only place allowed to call `session.commit()`. Use Cases and Repositories are strictly forbidden from committing or rolling back directly.
- **Async Enforcement**: All Use Cases and Repository methods MUST be `async`. No blocking I/O is allowed in any layer.
- **Directory Structure**: Fast API routes MUST be relocated to `backend/adapters/api/`.

## Risks / Trade-offs

- **[Risk] Mapping Overhead** → Mitigation: Use simple, explicit mappers. Domain purity is the priority.
- **[Risk] Migration Instability** → Mitigation: **Legacy code removal rule**: Legacy code (services/repositories/core) MUST be removed ONLY after all tests pass and the architecture is validated.
