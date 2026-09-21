## Context

Bindings are stored as strings such as `joystick0:button5` on each `Action`. `state.connectedGamepads` is keyed by the browser's `gamepad.index`, and that index is written straight into the config. The UI already shows "Joystick N" and the raw 0-based button index. There is no ignore list and no remap.

The game's own numbering cannot be read from the browser, so the tool can only give the user control and warnings, not guarantee a match.

## Goals / Non-Goals

**Goals:**
- Give the user a way to make the exported numbers match the game without re-binding.
- Make the button numbers match what vendor software shows.

**Non-Goals:**
- Predicting the game's device order.
- Persisting a "known good" order between sessions beyond what is needed in one visit.

## Decisions

- **Remap at export, not at bind time.** Keep bindings as detected, then rewrite the `joystickN` prefix in `generateConfig` using a `detectedIndex → exportNumber` map. Alternative: rewrite the stored bindings whenever the user edits the map. Rejected because it is lossy and makes undo hard.
- **Ignore is a UI filter plus a detection filter.** An ignored device is skipped in `pollGamepads`' detection calls; its existing bindings are kept unless the user discards them.
- **Label both bases.** "Button 26 (button25)" avoids confusing users who then look at the file. Alternative: only 1-based. Rejected because the config text would then not match the UI.
- **Loaded-config warning is non-blocking.** Bindings for missing devices are kept, since a user may load a config before plugging everything in.

## Risks / Trade-offs

- [Two devices with the same name (twin sticks, daisy-chained hardware)] → identify by index in the UI, and show the id string next to it; do not key any remap on the name.
- [Mapping is lost on reload] → acceptable for one session; consider saving it in local storage later.
- [Users remap wrongly and make things worse] → a reset button restores the detected numbering.

## Open Questions

- Whether to save the mapping in local storage. Can be added later without changing the specs above.
