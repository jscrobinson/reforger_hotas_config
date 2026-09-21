## Purpose
Defines how the configurator explains axis calibration and warns about limited axis range, so users do not assume the tool corrects what the game receives.

## ADDED Requirements

### Requirement: Calibration scope is stated
Every place the tool describes axis calibration SHALL say that it only affects how the tool detects and displays axes and does not change the values the game reads.

#### Scenario: Calibration checkbox
- **WHEN** a user views the calibration option
- **THEN** its text states that the game is not affected

#### Scenario: Troubleshooting text
- **WHEN** a user reads the troubleshooting section about axis offsets
- **THEN** it does not claim that calibration fixes the exported config

### Requirement: Limited-range warning
While calibration mode is on, the tool SHALL warn the user when a moved axis has a raw range clearly smaller than the full range, and SHALL say that the game will see the same limited range.

#### Scenario: Axis with a short travel
- **WHEN** a user moves an axis through its full travel and its raw values span only a small part of the full range
- **THEN** a warning names the axis and suggests calibrating in Windows or mapping the axis with another tool

#### Scenario: Normal axis
- **WHEN** an axis spans close to its full range
- **THEN** no warning is shown for it

### Requirement: Partial-range troubleshooting entry
The troubleshooting section SHALL contain an entry for an axis that reaches only part of its travel in game, listing Windows calibration, the game's own throttle or collective setting, and mapping software as things to try.

#### Scenario: Reading the entry
- **WHEN** a user opens the troubleshooting section
- **THEN** the entry is present and lists those three steps
