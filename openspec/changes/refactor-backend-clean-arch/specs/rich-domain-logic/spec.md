## ADDED Requirements

### Requirement: Encapsulated Domain Behavior
Domain entities SHALL encapsulate both state and behavior. All business rules and state transitions MUST be implemented within the domain layer via entity methods.

#### Scenario: Business rule enforcement in entity
- **WHEN** a state change occurs in a domain entity (e.g., status transition)
- **THEN** the entity SHALL perform all necessary validations and invariant checks before allowing the change.

### Requirement: Isolated Domain Logic
The domain layer MUST be pure Python and remain entirely independent of external frameworks such as SQLModel, Pydantic (as DTOs), or FastAPI.

#### Scenario: Infrastructure-free testing
- **WHEN** unit testing domain logic
- **THEN** the tests SHALL execute successfully without requiring a database connection, network access, or external library initialization.
