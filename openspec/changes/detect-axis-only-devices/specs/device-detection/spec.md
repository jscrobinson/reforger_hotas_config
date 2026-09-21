## Purpose
Defines how the configurator lets users know when a device is not detected and how they can still bind it, so that axis-only devices such as rudder pedals are not a dead end.

## ADDED Requirements

### Requirement: Wake-up guidance for undetected devices
The tool SHALL tell the user that a device may not appear until a button is pressed or an axis is moved, and SHALL show this near the device list whenever no device, or fewer devices than the user expects, are shown.

#### Scenario: No devices at all
- **WHEN** the tool detects no devices
- **THEN** the device list explains that the user should move the axes and press a button on the device

#### Scenario: A device appears after movement
- **WHEN** a device becomes visible to the browser after the user moves it
- **THEN** it is added to the list without a page reload

### Requirement: Missing-device troubleshooting
The tool SHALL offer short troubleshooting steps for a device that still does not appear: try another supported browser, close software that holds the device exclusively, and check it in the operating system's game controller list.

#### Scenario: Opening the steps
- **WHEN** a user opens "Device not listed?"
- **THEN** the steps are shown together with the manual device option

### Requirement: Manual device entry
The tool SHALL let a user add a manual device with a chosen joystick number, so inputs for a device the browser does not report can be typed in and written to the config.

#### Scenario: Pedals not detected
- **WHEN** a user adds a manual device as joystick 2 and enters `axis0+` for `HelicopterAntiTorqueLeft`
- **THEN** the downloaded config contains `joystick2:axis0+` for that action

#### Scenario: Manual device is labelled
- **WHEN** a manual device exists
- **THEN** it is shown in the device list marked as manual, with no live input display
