# Mesa de Luz (Light Table Session)

## ADDED Requirements

### Requirement: Physical Scale Calibration

- The system MUST calculate zoom levels in millimeters based on the device pixel ratio.
- The system MUST ensure the physical scale on the screen matches real-world dimensions.

#### Scenario: Rendering pattern at physical scale
Given the user activates the light table for a 10x10cm pattern
And the device has a specific pixel ratio
When the pattern is displayed
Then the physical rendering on the screen MUST measure exactly 10x10cm
