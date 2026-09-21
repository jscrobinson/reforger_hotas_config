## Why

Users want to fly fixed-wing aircraft and drive ground vehicles with their devices, and to use action sets from mods, but the tool only covers helicopters, turrets, on-foot control and the WCS mod. Fixed-wing aircraft and a controls tab for them arrived in the game around late August 2026. A pull request for ground vehicles (#11) was closed without merging. Users have named actions for an A-10 mod and for cars, but these names are unverified and come from third parties.

## What Changes

- Turn the single "WCS actions" switch into optional action groups, so more sets can be added without cluttering the default walkthrough.
- Add a group of game-native fixed-wing actions, using names taken from the game's own data.
- Add a group of ground-vehicle actions (steering, throttle, brake, and so on), revisiting the approach of #11 and the pedal limitation its author described.
- Add an optional group for the A-10 mod's actions, if the mod's names can be confirmed.
- Leave niche mods (for example a drone mod) out unless several users ask.

## Capabilities

### New Capabilities
- `aircraft-and-ground-vehicle-actions`: which optional action groups exist, how a group is enabled, and what each group contains.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: replace `wcsActionsEnabled` and `WCS_ACTIONS` with a group list and a group selector; the rebuild-on-toggle watcher becomes group-aware.
- Users with the WCS switch on keep the same behaviour.
- This is investigation-heavy. Names and presets must be checked in the game data before any group is added, so the change is split into an investigation step and one group at a time.
