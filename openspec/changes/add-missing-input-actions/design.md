## Context

Actions are hard-coded in `ACTIONS` and `WCS_ACTIONS` in `src/App.vue`. Export, import and test mode all iterate `state.actions`, so a new row is fully supported once it is in the array. Checked against the current code: none of the four actions exist, and `VONDirectToggle` is described as "push-to-talk".

The names, and the FilterPreset each needs, come from user reports rather than from the game data. See Open Questions.

## Goals / Non-Goals

**Goals:**
- Remove the need for the "bind a dummy action, rename it in Notepad" workaround for these four actions.

**Non-Goals:**
- Arbitrary custom action names (see `custom-actions-and-lossless-import`).
- Changing fire and weapon-switch guidance (see `fix-fire-and-weapon-switch-guidance`).

## Decisions

- **Plain rows, no new mechanism.** Add rows to the existing arrays. `VehicleNextWeapon`, `SwitchCameraType` and `VONDirect` go in `ACTIONS`; `WCS_Armament_ConfirmLock` goes in `WCS_ACTIONS`. Alternative considered: a per-action "advanced" group. Rejected as more UI for four rows.
- **Keep `VONDirectToggle`.** Removing it would strand existing configs. Only its hint changes.
- **Keep `WCS_Armament_CycleWeapon`.** Reports conflict about which action works on which server, so both stay and `VehicleNextWeapon` sits beside it.
- **Defaults:** `VehicleNextWeapon` `click`, `SwitchCameraType` `click`, `VONDirect` `hold`, `WCS_Armament_ConfirmLock` `click`.

## Risks / Trade-offs

- [Wrong FilterPreset for `WCS_Armament_ConfirmLock`; reports say click, press and hold] → verify in game before merging, and record the result in the row's hint.
- [Case of `VONDirect`; reports write both `VOnDirect` and `VONDirect`] → check the game's own `InputUserSettings` output and use its spelling.
- [More rows lengthen the walkthrough] → mark all four `optional` or `important` per how commonly they are needed; users can skip.

## Open Questions

- Correct name of the ripple-quantity action: `TurretWeaponNextRippleQuantity` (tool) or `TurretNextRippleQuantity` (user configs). Resolve by checking the game data, then rename in a follow-up task if needed. Importing old configs must still work if the name changes.
