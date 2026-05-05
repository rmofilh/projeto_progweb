## ADDED Requirements

### Requirement: Repository Abstraction via Protocols
Use cases MUST NOT depend on concrete repository implementations. All persistence operations MUST be accessed through Protocols (Interfaces) defined in the Domain layer.

#### Scenario: Dependency inversion in use cases
- **WHEN** a Use Case is instantiated
- **THEN** it SHALL receive its repository dependencies via constructor injection, allowing for any implementation that satisfies the protocol.

### Requirement: Persistence Mapper Isolation
The persistence layer SHALL implement explicit mapping between ORM models (SQLModel) and Domain Entities. ORM models MUST NEVER cross the boundary into the Use Case layer.

#### Scenario: Data mapping integrity
- **WHEN** a repository retrieves data from the database
- **THEN** it SHALL map the internal ORM model to a corresponding Domain Entity before returning it to the Use Case.
