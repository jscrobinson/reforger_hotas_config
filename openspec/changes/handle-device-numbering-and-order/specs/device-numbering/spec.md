## Purpose
Defines how the configurator numbers devices in the exported config and helps the user notice when those numbers do not match what the game uses.

## ADDED Requirements

### Requirement: Export numbers can differ from detected numbers
The tool SHALL let the user assign the joystick number written to the config for each detected device, and SHALL apply that mapping to every binding of that device on export.

#### Scenario: Swapping two devices
- **WHEN** a user has bound inputs on devices 0 and 1 and swaps their export numbers
- **THEN** the downloaded config writes the inputs of the first device as `joystick1:...` and of the second as `joystick0:...`

#### Scenario: Default mapping
- **WHEN** the user has not changed the mapping
- **THEN** the config uses the detected device numbers, as it does today

### Requirement: Unwanted devices can be hidden
The tool SHALL let the user mark a detected device as ignored, and an ignored device SHALL NOT be offered for binding or included in binding detection.

#### Scenario: Ignoring a virtual device
- **WHEN** a user ignores a device
- **THEN** pressing its buttons does not create a binding and it is not shown as a binding target

#### Scenario: Existing bindings on an ignored device
- **WHEN** the user ignores a device that already has bindings
- **THEN** the tool asks before discarding them or keeps them written to the config

### Requirement: Button numbers shown as vendor tools show them
Wherever the tool shows a button number to the user it SHALL show the 1-based number, and it SHALL show the 0-based value that is written to the config where the two differ.

#### Scenario: Pressing a button
- **WHEN** a user presses the 26th button of a device
- **THEN** the interface shows "Button 26" and the config value `button25`

### Requirement: Loaded config with missing devices is flagged
When a loaded config uses a joystick number with no connected device, the tool SHALL tell the user which numbers are missing.

#### Scenario: Config from another setup
- **WHEN** a user loads a config that binds `joystick2` while only two devices are connected
- **THEN** a message names `joystick2` as not currently connected and the bindings are kept
