## Purpose
Defines how ready-made starter configs for common devices are offered and accepted, so users can begin from a working setup for their hardware.

## ADDED Requirements

### Requirement: Profiles listed from a manifest
The app SHALL build its list of starter profiles from a manifest file, and adding a profile SHALL NOT require a code change.

#### Scenario: Adding a profile
- **WHEN** a `.conf` file and a manifest entry are added to the profiles folder
- **THEN** the profile appears in the list after the next build

#### Scenario: Existing templates
- **WHEN** the manifest is loaded
- **THEN** the Logitech Extreme 3D Pro and Saitek X56 profiles are still listed and load as before

### Requirement: Profile description
Each profile SHALL show the device name, what parts it covers (stick, throttle, pedals), its origin, and the game version it was checked on.

#### Scenario: Viewing the list
- **WHEN** a user opens the profile list
- **THEN** every entry displays those four details

### Requirement: Device-count notice
When a profile binds more devices than are connected, the app SHALL tell the user before or when loading it.

#### Scenario: Two-device profile with one device
- **WHEN** a user loads a profile that uses `joystick0` and `joystick1` while one device is connected
- **THEN** a message says that a second device is expected

### Requirement: Contribution rules
The repository SHALL document that a submitted profile must have been used in game, must name the exact device model, and must not include personal data.

#### Scenario: Submitting a profile
- **WHEN** a contributor reads the contribution note
- **THEN** it lists those three conditions and how to submit the file
