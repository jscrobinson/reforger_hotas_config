## Why

Hat switches are detected as `axisN+` / `axisN-`, but the game reads a hat as `povN_up`, `pov_right` and so on. Users report freelook stuck up-and-right or forward-and-left, an "axis 9" pinned at its default, helicopters tipping over at engine start, and hats that scroll in one direction only. Many fixed it by hand-editing the `.conf`. Related: #5.

## What Changes

- Detect hat presses and write them as `joystickN:pov_up`, `pov_right`, `pov_down`, `pov_left`; use `pov2_*` and `pov3_*` for a second and third hat.
- Map a hat direction to the pov input instead of an axis when the device reports one, and show the direction in a readable form.
- Give `SelectAction` a distinct input per direction, so one hat can cycle both ways (today both directions write the `previous` preset).
- Make loading a config that contains `pov_*` inputs show them against their actions.

## Capabilities

### New Capabilities
- `hat-switch-input`: how hat switches are detected, named in the config and shown to the user.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: hat and axis detection in `detectInput` and `detectTestModeInput`, the "hat mode" toggle, `SelectAction` handling, import parsing, and the input labels shown in the UI.
- Exported config gains `pov_*` inputs. Configs using `axisN±` for hats keep loading.
- Likely closes #5 for hat-caused cases. Some causes of a stuck camera (Linux, drivers) remain and are covered by `add-known-issues-help`.
