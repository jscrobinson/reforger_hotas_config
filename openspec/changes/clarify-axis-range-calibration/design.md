## Context

`updateAxisCalibration` and `normalizeAxisValue` in `src/App.vue` track min, max and centre per axis and rescale values for input detection and the on-screen bars, only while `calibrationModeEnabled` is on. `generateConfig` writes bindings as `axisN±` and does not involve calibration, so the game receives raw values.

## Goals / Non-Goals

**Goals:**
- Remove the misleading impression that calibration fixes range in game.
- Tell the user early when their device reports a short range.

**Non-Goals:**
- Changing exported values.
- Building a curve or mapping editor (that is what vJoy and Joystick Gremlin do).

## Decisions

- **Warn from the data the tool already collects.** Calibration tracks min and max per axis, so a warning costs no new detection code. The threshold is chosen when implementing and checked against a few devices; a span under about half of the full range is a starting point.
- **Text only for the config.** The multiplier idea is left out of the requirements until it is shown to work for the game's flight axes. A user showed a multiplier filter scaling axes for a mod's drone actions, which is not evidence for helicopter actions.
- **Keep calibration mode.** It is still needed for devices with offset centres such as a rudder that reads 0 to 1.

## Risks / Trade-offs

- [False warnings on axes that legitimately only go one way (throttle sliders)] → measure span per direction from the learned centre, and only warn on axes the user moved.
- [Warning wording scares users with a healthy device] → phrase it as "the game may not reach the ends" with the fix list.

## Open Questions

- Whether an exported multiplier filter scales flight axes in game. If it does, propose it as a separate change with its own spec; it does not affect the tasks below.
