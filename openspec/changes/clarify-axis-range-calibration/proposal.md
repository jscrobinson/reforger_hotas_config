## Why

Several users report an axis that only travels 15-25% in game, while the tool with "Axis Calibration" on shows a full range. Calibration in the tool only rescales what the tool sees while detecting inputs; the game still receives the raw device values. The users who fixed it did so outside the tool (vJoy with Joystick Gremlin curves). The current wording, "the tool will automatically learn and adjust for offset center points", reads as if the exported config is corrected too.

## What Changes

- Rewrite the calibration checkbox text and the troubleshooting paragraph to say plainly that calibration affects detection in the tool only and does not change what the game reads.
- While calibration mode is on, warn when an axis's raw range is much smaller than the full range, and say the game will see the same small range.
- Add a troubleshooting entry for partial range: calibrate in Windows, check the game's own collective/throttle setting, and use a mapping tool to widen the range if needed.
- Investigate whether the exported config can scale an axis in game (a multiplier filter has been reported to work for a mod's drone actions) and decide whether to offer it; see the design.

## Capabilities

### New Capabilities
- `axis-range`: how axis range and calibration are described to the user and when the tool warns about a limited range.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: calibration checkbox and instructions text, the troubleshooting paragraphs, and a warning next to the axis visualisation.
- No change to exported config unless the investigation ends with the optional multiplier being approved as a separate change.
