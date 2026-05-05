# Task List: Backend Clean Architecture Refactor

> [!IMPORTANT]
> **Global Constraints (Logic Leakage Prevention):**
> - Business rules MUST exist ONLY in domain entities.
> - Use Cases, Controllers, and Repositories MUST NOT implement business rules.
> - Repositories MUST return ONLY domain entities; ORM models NEVER leave the persistence layer.
> - All Use Cases and Repository methods MUST be `async`.
> - Transaction `commit()` MUST happen ONLY in the API adapter layer.

## 1. Domain Layer Refactoring (Rich & Pure)

- [x] 1.1 Create `backend/domain/entities/` and implement pure entities (POPOs) for `User`, `Pattern`, `Collection`, and `UserPattern`.
- [x] 1.2 Implement ALL business rules and status transition logic inside Domain entities (fail-fast invariants).
- [x] 1.3 Create `backend/domain/repositories/` and define Protocols (Interfaces) for all persistence contracts.
- [x] 1.4 Define domain-specific exceptions in `backend/domain/exceptions/`.

## 2. Use Cases Layer & Application Ports

- [x] 2.1 Create `backend/use_cases/ports/` and define the `MessagingBroker` Protocol (application-level port).
- [x] 2.2 Implement `AddFavorite` use case in `backend/use_cases/favorites/`.
- [x] 2.3 implement persistence-based idempotency in Use Cases (storing `correlation_id` via repository).
- [x] 2.4 Refactor authentication and catalog orchestration into `backend/use_cases/`.
- [x] 2.5 Ensure Use Cases ONLY call entity methods for business logic and never mutate state directly.

## 3. Infrastructure & Persistence Adapters

- [x] 3.1 Relocate SQLModel models to `backend/adapters/persistence/sqlmodel/models.py`.
- [x] 3.2 Implement mandatory `_to_entity` mappers in `backend/adapters/persistence/sqlmodel/mappers.py`.
- [x] 3.3 Implement `async` repositories in `backend/adapters/persistence/sqlmodel/repositories.py` that return ONLY domain entities.
- [x] 3.4 Ensure Repositories NEVER perform `commit()` or `rollback()`.
- [x] 3.5 Move database engine and messaging implementation to `backend/infrastructure/`.

## 4. API Adapters & Entry Points

- [x] 4.1 Relocate all routes to `backend/adapters/api/` and update `main.py`.
- [x] 4.2 Update routes to inject/call Use Cases and perform the final `session.commit()`.
- [x] 4.3 Refactor background workers in `backend/adapters/workers/` to call Use Cases.
- [x] 4.4 Verify that ALL entry points and downstream calls are `async`.

## 5. Verification & Safe Cleanup

- [x] 5.1 Run isolated Domain unit tests (no DB).
- [x] 5.2 Run Use Case orchestration tests with mocked ports/repositories.
- [x] 5.3 Run full integration tests verifying ORM isolation.
- [x] 5.4 ONLY AFTER architecture validation and all tests pass: Remove legacy code folders (`services/`, `repositories/`, `core/`).
