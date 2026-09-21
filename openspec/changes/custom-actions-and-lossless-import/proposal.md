## Why

Users work around missing actions by binding a placeholder and renaming it in Notepad, and by pasting blocks in by hand. When they then load such a config into the tool and download it again, any action the tool does not know is dropped: one user lost `VehicleNextWeapon`, chaff and flare blocks this way. There is also no way to type an input by hand, and users cannot find action names or use them (some paste invented syntax from AI assistants).

## What Changes

- Import keeps every action block the tool does not recognise, and export writes it back unchanged.
- Show a short notice on load: how many unrecognised actions were kept.
- Let the user add an action by name with a FilterPreset and bind it like any other step.
- Let the user type an input for any step (for example `joystick1:pov_up`) as an alternative to pressing it, with validation.

## Capabilities

### New Capabilities
- `config-import-export`: what happens to the content of a loaded config, how custom actions are added and how typed inputs are validated.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: `parseConfig`, `generateConfig`, the action list, and a small "add action / type input" form.
- `src/types/index.ts`: state to hold kept blocks and custom actions.
- Supplies the typed-input mechanism used by `detect-axis-only-devices` and helps `support-hat-switch-pov-inputs` users with unusual hats.
- Everything typed by the user is written to a config file, so names and inputs must be validated (see Design).
