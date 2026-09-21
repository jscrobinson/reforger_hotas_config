## Purpose
Defines which game actions the configurator lets a user bind, so a generated config does not need hand editing to add commonly used actions.

## ADDED Requirements

### Requirement: Pilot weapon cycling action
The tool SHALL offer a `VehicleNextWeapon` action that can be bound to a button and is written to the exported config under that exact name.

#### Scenario: Binding the action
- **WHEN** a user binds a button to the `VehicleNextWeapon` step and downloads the config
- **THEN** the config contains an `Action VehicleNextWeapon` block with that button as an input

#### Scenario: Existing WCS cycling action kept
- **WHEN** WCS actions are enabled
- **THEN** `WCS_Armament_CycleWeapon` is still offered, so configs that already use it keep loading

### Requirement: Third-person camera action
The tool SHALL offer a `SwitchCameraType` action.

#### Scenario: Binding the action
- **WHEN** a user binds a button to `SwitchCameraType` and downloads the config
- **THEN** the config contains an `Action SwitchCameraType` block with that button as an input

### Requirement: Hold-to-talk proximity voice action
The tool SHALL offer `VONDirect` as a hold-to-talk action, separate from `VONDirectToggle`, and the hints of both SHALL describe their real behaviour.

#### Scenario: Push-to-talk binding
- **WHEN** a user binds a button to `VONDirect`
- **THEN** the exported action uses the hold FilterPreset and the hint says the voice is active while the button is held

#### Scenario: Toggle hint
- **WHEN** a user views `VONDirectToggle`
- **THEN** its hint says it toggles voice on and off and does not call it push-to-talk

### Requirement: Lock confirmation action for WCS
When WCS actions are enabled, the tool SHALL offer `WCS_Armament_ConfirmLock` so a user can confirm a missile lock on a different input from `WCS_Armament_ActivateLock`.

#### Scenario: Binding both lock actions
- **WHEN** a user binds `WCS_Armament_ActivateLock` and `WCS_Armament_ConfirmLock` to different buttons
- **THEN** the config contains an `Action` block for each with its own button

#### Scenario: WCS actions disabled
- **WHEN** WCS actions are not enabled
- **THEN** `WCS_Armament_ConfirmLock` is not listed

### Requirement: Loading a config that uses the new actions
Configs that contain any of the new actions SHALL load with those bindings shown against the matching steps.

#### Scenario: Round trip
- **WHEN** a user downloads a config with the new actions bound, then loads it again
- **THEN** each new action shows the same binding it had before
