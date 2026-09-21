## Purpose
Defines how the configurator treats a loaded config and user-entered actions and inputs, so hand-made additions survive a round trip and can be created without a text editor.

## ADDED Requirements

### Requirement: Unknown actions survive a round trip
When a loaded config contains an action block the tool does not have a step for, the tool SHALL keep the block and write it unchanged into the next downloaded config.

#### Scenario: Config with an extra block
- **WHEN** a user loads a config containing `Action VehicleNextWeapon` that has no step, changes another binding, and downloads
- **THEN** the downloaded config still contains the `VehicleNextWeapon` block with its original inputs

#### Scenario: Notice on load
- **WHEN** a config with unrecognised actions is loaded
- **THEN** the user is told how many were kept and that they are not shown as steps

### Requirement: Kept blocks yield to a step of the same name
If a later version of the tool has a step for an action that was previously kept, the step SHALL take over that block's inputs and the block SHALL NOT be written twice.

#### Scenario: Duplicate name
- **WHEN** a loaded action has the same name as a step
- **THEN** its inputs appear on the step and the exported config contains one block for that name

### Requirement: Custom actions
The tool SHALL let the user add an action by name and FilterPreset, bind it like any other step, and include it in the exported config.

#### Scenario: Adding an action
- **WHEN** a user adds an action named `SwitchCameraType` with the click preset and binds a button
- **THEN** the exported config contains an `Action SwitchCameraType` block with that input

#### Scenario: Invalid name
- **WHEN** a user enters a name with spaces, braces, quotes or line breaks
- **THEN** the tool rejects it with a message and adds nothing

### Requirement: Typed inputs
The tool SHALL accept a typed input for any step in the form `joystick<N>:button<M>`, `joystick<N>:axis<M>+` or `-`, or `joystick<N>:pov[<K>]_<up|right|down|left>`, and SHALL reject anything else.

#### Scenario: Valid input
- **WHEN** a user types `joystick1:pov_up` for a step
- **THEN** it is added as a binding for that step

#### Scenario: Invalid input
- **WHEN** a user types text that does not match those forms
- **THEN** the tool shows what forms are accepted and adds nothing

### Requirement: No user text is written unvalidated
Action names, presets and inputs written into a config SHALL come only from validated values, never from raw text of a loaded file other than preserved blocks kept exactly as loaded.

#### Scenario: Quote in a typed value
- **WHEN** a typed value contains a double quote or a newline
- **THEN** it is rejected and the exported config is unaffected
