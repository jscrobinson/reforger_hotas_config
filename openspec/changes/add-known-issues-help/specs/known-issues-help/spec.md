## Purpose
Defines the troubleshooting content shipped with the configurator, so common setup problems can be solved from the page without asking for help.

## ADDED Requirements

### Requirement: Symptom-based known issues section
The app SHALL provide a Known issues section, inside the existing collapsible documentation, that lists common problems by the symptom a user sees and gives the fix for each.

#### Scenario: Config not offered in game
- **WHEN** a user reads the entry for a config that does not appear in the game
- **THEN** it covers the `.conf` extension (not `.conf.txt`), the correct folder, the Controllers tab rather than Controls, redirected Documents folders, and restarting the game or saving a copy under a new name

#### Scenario: Devices not detected or wrong
- **WHEN** a user reads the entry for missing or mismatched devices
- **THEN** it covers trying another browser, virtual devices and hiding tools, the game's device number setting, and pointing to the device controls in the tool

#### Scenario: Camera or axes stuck
- **WHEN** a user reads the entry for freelook or an axis stuck in one direction
- **THEN** it covers hat switches, Windows calibration, and the Linux specific causes

### Requirement: Platform-specific save locations are correct
The save location for each supported platform SHALL be verified before being published in the README and in the app.

#### Scenario: Linux with Proton
- **WHEN** a user reads the Linux instructions
- **THEN** the path matches the location that has been checked on a Linux install, including the Steam app id used in it

### Requirement: Limits are stated with their cause
The section SHALL state the maximum number of buttons the tool can read and whether the limit comes from the tool, the browser or the device driver.

#### Scenario: Device with many buttons
- **WHEN** a user with a device that has more than 32 buttons reads the entry
- **THEN** it says which limit applies and lists the workaround, such as a device mode with more buttons or a mapping tool

### Requirement: Unverified advice is labelled
Any entry based on user reports that has not been checked SHALL be labelled as such.

#### Scenario: Unverified entry
- **WHEN** an entry has not been tested by a maintainer
- **THEN** it says "reported by users"
