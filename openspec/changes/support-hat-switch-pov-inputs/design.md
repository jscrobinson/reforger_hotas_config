## Context

Today `detectInput` and `detectTestModeInput` in `src/App.vue` treat a large single-frame jump to a near-discrete value on any axis as a hat press and emit `axisN±`. A "hat mode" checkbox loosens that detection. `SelectAction` has one row with the `previous` preset. Nothing in the code produces or parses `pov` inputs.

The browser Gamepad API does not expose a POV hat directly. Chrome and Edge report a hat as one extra axis with radial values, or as four D-pad buttons, depending on the device and driver. Firefox may differ.

## Goals / Non-Goals

**Goals:**
- Produce config inputs the game reads correctly for hats.

**Non-Goals:**
- Fixing Linux or driver-level stuck axes (see `add-known-issues-help`).
- Supporting hats on devices the browser exposes only as an ambiguous axis with no way to tell it is a hat, beyond the existing hat mode.

## Decisions

- **Hat axis to pov mapping.** When an axis value matches the radial hat encoding (a small set of discrete values), convert to a direction and write `pov_<dir>`. The device's neutral value differs by model (one device reports a resting value of about 3.29), so the neutral value is learned from the baseline the tool already stores, not hard-coded.
- **Which pov index.** The first hat found on a device is `pov`, then `pov2`, `pov3`. Alternative considered: ask the user which hat. Rejected as extra steps; a manual override lives in the custom-input entry of `custom-actions-and-lossless-import`.
- **`SelectAction` split.** Add a second row (next direction) that shares the config action name through the existing `SHARED_ACTION_NAMES` mechanism, as `HelicopterSightZeroingUp` and `Down` already do.
- **Keep hat mode.** It remains for devices that cannot be recognised automatically.

## Risks / Trade-offs

- [Wrong direction mapping for a device the author cannot test] → make mapping table-driven, add a test-mode readout of the detected direction, and ask reporters with T16000M, X56, VKB and Warthog hats to try it.
- [Some browsers give D-pad buttons instead of an axis] → also map D-pad buttons 12-15 when the device reports them as hat directions; verify with a gamepad that reports the standard mapping.
- [Users with working `axisN±` hat configs] → old configs load unchanged; only newly detected hat presses use `pov_*`.

## Open Questions

- What the exact pov index is when a stick has both a hat and a mini-stick. Can be settled with a real device, since the naming rule above does not change.
