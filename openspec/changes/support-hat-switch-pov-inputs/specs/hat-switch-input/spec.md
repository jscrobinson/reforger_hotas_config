## Purpose
Defines how the configurator detects hat switches and writes them to the config, so hat bindings for actions such as freelook work in game without hand editing.

## ADDED Requirements

### Requirement: Hat directions are written as pov inputs
When a user binds an action by pressing a hat direction, the tool SHALL write the binding as `joystickN:pov_up`, `pov_right`, `pov_down` or `pov_left`, not as an axis.

#### Scenario: Binding freelook to a hat
- **WHEN** a user presses hat up while binding `FreelookUp` and downloads the config
- **THEN** the `FreelookUp` input in the config is `joystickN:pov_up` for that device

### Requirement: Additional hats use numbered pov inputs
A second and third hat on the same device SHALL be written as `pov2_*` and `pov3_*`.

#### Scenario: Second hat
- **WHEN** a user binds a direction on the device's second hat
- **THEN** the input is written as `joystickN:pov2_<direction>`

### Requirement: Hat state does not read as a stuck axis
The tool SHALL NOT report a hat's resting position as an axis input while the user is binding or testing.

#### Scenario: Hat at rest
- **WHEN** a device with a hat is connected and nobody touches the hat
- **THEN** no axis binding is proposed for it

### Requirement: Select action works in both directions
`SelectAction` SHALL be bindable to two inputs, one per direction, and the exported config SHALL give them different presets so a single hat can cycle forward and backward.

#### Scenario: Binding both directions
- **WHEN** a user binds hat up and hat down to `SelectAction`
- **THEN** the config has one input with the `previous` preset and one with the `next` preset

### Requirement: Existing axis-based hat bindings still load
Configs that store a hat as `axisN+` or `axisN-` SHALL load unchanged.

#### Scenario: Old config
- **WHEN** a user loads a config that contains `joystick0:axis9+` for a hat
- **THEN** the binding appears and is not silently converted or removed
