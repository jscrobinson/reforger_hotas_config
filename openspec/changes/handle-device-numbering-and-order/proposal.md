## Why

The most common reason for "everything is bound but the game ignores it" is that the device number in the config does not match the device the game assigns. The tool writes the browser's gamepad index as the joystick number. The game numbers devices differently, and both orders can change with USB order, power-on order, extra virtual devices (vJoy, headsets) and driver state. Users also see button numbers that are one off from their vendor software, because the config counts from 0. Related: #3, #13.

## What Changes

- Let the user choose the joystick number written for each detected device before download (swap two devices, or assign explicit numbers), without redoing any bindings.
- Let the user hide devices that should not be bound (headsets, virtual devices, duplicates) so they do not shift or clutter the list.
- Show button numbers the way vendor tools do (1-based) next to the value written to the config (0-based).
- When a config is loaded, warn if it uses joystick numbers that no connected device has.

## Capabilities

### New Capabilities
- `device-numbering`: how detected devices map to the joystick numbers in the exported config, and how mismatches are surfaced.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: joystick list, binding storage and `generateConfig` (a remap step at export), visualisation labels, `parseConfig` (mismatch check).
- `src/types/index.ts`: a device-number mapping in app state.
- Bindings stay stored against the detected device, and the remap is applied only when writing, so a user can change it late.
- Does not fix the game choosing a different order at run time; see `add-known-issues-help` for how to check that in the game's settings.
