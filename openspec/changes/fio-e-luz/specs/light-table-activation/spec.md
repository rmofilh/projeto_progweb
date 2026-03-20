# Ativação da Mesa de Luz

## ADDED Requirements

### Requirement: Secure Light Table Operation

- The system MUST hide all navigation bars when the light table is activated.
- The system MUST activate the Wake Lock API to prevent the screen from sleeping.
- The system MUST disable scroll and pinch-to-zoom APIs.
- The system MUST NOT allow exiting the mode on accidental touch.

#### Scenario: Activating the light table
Given the user selects a pattern
When the user activates the Light Table mode
Then the system MUST hide navigation
And the system MUST activate Wake Lock
And the system MUST disable scrolling

#### Scenario: Exiting the light table
Given the light table is active
When the user executes a long intentional touch on the center of the screen
Then the system MUST exit the light table mode
And the system MUST restore navigation and screen sleep settings
