## Why

The current backend implementation suffers from architectural logic leakage, anemic domain models, and tight coupling with SQLModel/FastAPI. This refactor is mandatory to enforce 100% compliance with Clean Architecture and Domain-Driven Design (DDD), ensuring a rich domain model, absolute decoupling, and a consistent asynchronous execution model.

## What Changes

- **Strict Layering (Adapters/Use Cases/Domain)**: Restructure the `backend/` directory. All external interfaces (API, workers) MUST be moved to `adapters/` (e.g., `backend/adapters/api/`).
- **Rich Domain Isolation**: Domain entities MUST encapsulate ALL business logic and invariants. Business logic outside the domain layer is strictly forbidden (**Logic Leakage Prevention**).
- **ORM Boundary Enforcement**: Repositories MUST return ONLY domain entities. ORM models (SQLModel) MUST NEVER leave the persistence layer. `_to_entity` conversion is mandatory.
- **Messaging Port**: Define messaging interfaces as ports in the application layer (`use_cases/ports/`). The domain layer MUST NOT have any knowledge of messaging or infrastructure.
- **Transaction Control**: Database `commit()` MUST happen ONLY in the API layer (`adapters/api/`). Repositories and Use Cases MUST NOT perform commits.
- **100% Async Model**: All use cases and repository methods MUST be `async`. Blocking I/O is strictly prohibited.
- **Safe Cleanup**: Legacy code (services, repositories, core) MUST be removed ONLY after all tests pass and the new architecture is validated.

## Capabilities

### New Capabilities
- `clean-architecture-core`: Foundational tiered structure emphasizing dependency inversion and layer isolation.
- `rich-domain-logic`: Encapsulation of all business invariants and rules within pure domain entities.
- `repository-pattern-abstraction`: Mandated mapping and entity-only returns for the persistence layer.
- `application-ports`: Orchestration through ports and use cases with strict business-logic-free flow.

### Modified Capabilities
<!-- None -->

## Impact

- **Architecture**: Move `backend/api/` to `backend/adapters/api/`.
- **Infrastructure**: Moves messaging and DB engine config to `infrastructure/`.
- **Use Cases**: New orchestration layer depending on repo protocols and application ports.
- **Domain**: Pure, framework-agnostic entities with behavior.
