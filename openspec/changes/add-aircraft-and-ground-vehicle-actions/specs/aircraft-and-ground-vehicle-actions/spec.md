## Purpose
Defines the optional action groups the configurator offers beyond the default helicopter and on-foot set, so users can bind fixed-wing, ground vehicle and supported mod actions without hand editing.

## ADDED Requirements

### Requirement: Optional action groups
The tool SHALL let the user switch optional action groups on and off, and SHALL keep them out of the walkthrough while they are off.

#### Scenario: Group off
- **WHEN** a group is not enabled
- **THEN** its actions are not listed and are not written to the config

#### Scenario: Group turned on
- **WHEN** a user enables a group
- **THEN** its actions are added to the list and existing bindings on other actions are kept

#### Scenario: Group turned off again
- **WHEN** a user disables a group
- **THEN** its actions are removed from the list and the other bindings stay

### Requirement: WCS behaviour preserved
The existing WCS Armament option SHALL keep working as one of the groups, with the same actions and defaults as before this change.

#### Scenario: WCS enabled
- **WHEN** the user enables the WCS group
- **THEN** the same WCS actions are listed as before

### Requirement: Fixed-wing group
The tool SHALL provide a fixed-wing group whose action names and presets have been checked against the game, and SHALL NOT list an action whose name is unverified.

#### Scenario: Enabling the group
- **WHEN** a user enables fixed-wing actions
- **THEN** each listed action has a verified name and default preset

### Requirement: Ground-vehicle group
The tool SHALL provide a ground-vehicle group covering at least steering, throttle and brake, with axis-style inputs supported for them.

#### Scenario: Binding steering to an axis
- **WHEN** a user binds a steering step to an axis direction
- **THEN** the config contains that input for the action

### Requirement: Mod groups state their source
Any group for a mod SHALL name the mod and say that it only works with that mod loaded.

#### Scenario: Reading a mod group
- **WHEN** a user enables a mod group
- **THEN** the mod's name and requirement are shown next to the switch
