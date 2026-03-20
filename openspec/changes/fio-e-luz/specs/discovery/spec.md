# Descoberta Rápida (Discovery)

## ADDED Requirements

### Requirement: Catalog Navigation

- The system MUST retrieve and expose Collections on the main interface.
- The system MUST NOT use touch targets smaller than 56px.
- The system MUST guarantee a AAA contrast ratio for all typographic elements.

#### Scenario: User browses collections
Given the user opens the application
When the catalog page is loaded
Then the system MUST display all available collections
And all interactive elements MUST have touch targets >= 56px
And typographies MUST have a AAA contrast ratio

#### Scenario: API Timeout handling
Given the user opens the catalog page
When the API response for collections takes longer than 500ms
Then the interface MUST display skeleton loaders based on shadcn/ui
And the interface MUST disable related user actions until loaded
