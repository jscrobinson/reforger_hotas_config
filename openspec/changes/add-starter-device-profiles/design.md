## Context

`loadVanillaConfig` in `src/App.vue` fetches `/vanilla_configs/<file>` and calls `parseConfig`. Two buttons are written into the template with their file names. The two files are Joystick_LogitechExtreme3DPro_0.conf and Joystick_SaitekProFlightX56Rhino_0_Stick_1_Throttle.conf. Loading replaces all current bindings.

A profile is only valid for the exact model, and its joystick numbers must match the user's numbering.

## Goals / Non-Goals

**Goals:**
- Make adding a profile a data change.
- Let users see what a profile is and whether it fits.

**Non-Goals:**
- Writing profiles for hardware nobody has tested.
- Auto-matching a connected device to a profile (a later idea; the list is enough first).

## Decisions

- **JSON manifest** in `public/vanilla_configs/` listing `file`, `label`, `covers`, `source`, `gameVersion`. Alternative: derive labels from file names. Rejected: names are not descriptive enough and the extra fields are needed.
- **Manifest loaded at start** with a fall back to the two known profiles if the fetch fails, so the current behaviour never disappears.
- **Profiles are real configs from real hardware.** Because they cannot be generated, a profile is added only with a contributor who has tested it. This limits how fast the list grows, on purpose.
- **Confirm before replacing** existing bindings when loading, since loading clears them today.

## Risks / Trade-offs

- [A profile does not match a user's numbering] → the device-count notice, plus the numbering controls from `handle-device-numbering-and-order`.
- [A contributed file contains personal data (device serials, file paths)] → review each file before merge; the config format holds only action names and inputs, but check anyway.
- [Users load a profile for a similar but different model] → show the exact model in the label.

## Open Questions

- Whether contributors should submit through pull requests or issues with an attachment. Either works with the manifest; decide when writing the contribution note.
