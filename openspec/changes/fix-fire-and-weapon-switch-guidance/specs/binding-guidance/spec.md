## Purpose
Defines the advice the configurator gives while a user binds fire and weapon-switch actions, so following it produces a config that works in game.

## ADDED Requirements

### Requirement: Fire guidance matches verified in-game behaviour
The tool SHALL show fire-binding guidance that has been verified in game, and SHALL NOT tell users to bind every fire action to one button unless that has been verified to work.

#### Scenario: Binding a fire action
- **WHEN** a user reaches a fire action step
- **THEN** the note names which fire action applies to which situation (on foot, vanilla helicopter or turret, WCS helicopter) and which ones to leave unbound

#### Scenario: Hint text
- **WHEN** a user views the hint of any fire action
- **THEN** the hint does not contain the phrase "use same trigger as all fire actions" unless the verified recipe still says so

### Requirement: Binding reuse is offered only where advised
The tool SHALL offer to copy an existing binding onto another action only for actions that the current guidance says share an input.

#### Scenario: Actions that do not share an input
- **WHEN** a user has bound `TurretFire` and reaches an action that the guidance says should stay separate
- **THEN** no "use the same input" suggestion is shown

### Requirement: Weapon-switch guidance describes tap and long press
The weapon-switch note SHALL state which actions go on the shared weapon-switch button, whether a tap or a long press is expected, and that binding extra weapon-switch actions can make one press advance more than one weapon.

#### Scenario: Weapon-switch step
- **WHEN** a user reaches a weapon-switch action step
- **THEN** the note lists the actions for that button and states the press style

### Requirement: Guidance lists no unknown actions
Every action named in a note SHALL exist as a step in the tool, so users are never told to bind something they cannot find.

#### Scenario: Note mentions an action
- **WHEN** a note names an action such as `VehicleNextWeapon`
- **THEN** that action is present in the action list
