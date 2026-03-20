# Risco (Pattern)

## ADDED Requirements

### Requirement: Pattern Creation and Metadata

- The system MUST ensure that pattern creation requires a clean vector/image file.
- The system MUST store metadata representing the ideal physical proportion (e.g., cm² for hoop size).

#### Scenario: Successful pattern creation with valid metadata
Given an admin provides a valid vector file
And provides proportion metadata (e.g., 15x15 cm)
When the pattern is saved
Then the system MUST store the pattern as available
And the system MUST retain the exact physical scale metadata

#### Scenario: Pattern creation without required metadata
Given an admin provides a vector file without proportion metadata
When the pattern is saved
Then the system MUST return an HTTP 422 Unprocessable Entity error stating the metadata is missing

#### Scenario: System failure on pattern creation
Given the backend attempts to save the pattern
When the PostgreSQL database is inaccessible
Then the FastAPI system MUST return an HTTP 500 Internal Server Error
And the frontend UI MUST display an error toast using shadcn/ui
