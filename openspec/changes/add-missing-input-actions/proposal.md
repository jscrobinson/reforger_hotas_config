## Why

Several actions that Arma Reforger and the WCS mod use are missing from the tool, so users bind a placeholder action, then rename it by hand in the `.conf`. That workaround is the single most repeated support answer. Related open issues: #4 (`VehicleNextWeapon`), #6 (third-person camera), #12 (`WCS_Armament_ConfirmLock`).

## What Changes

- Add `VehicleNextWeapon` (pilot weapon cycling in WCS and vehicle helicopters) next to the existing weapon-switch rows.
- Add `SwitchCameraType` (toggle third-person view).
- Add `VONDirect` (proximity voice, hold to talk). Keep `VONDirectToggle`, but correct its hint: it is currently described as push-to-talk although it toggles.
- Add `WCS_Armament_ConfirmLock` to the optional WCS actions, next to `WCS_Armament_ActivateLock`.
- Confirm the ripple-quantity action name (`TurretWeaponNextRippleQuantity` in the tool, `TurretNextRippleQuantity` in user configs) and correct it if the tool's name is wrong.

## Capabilities

### New Capabilities
- `action-catalog`: which actions the tool offers for binding, with their default FilterPreset and hint text.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: `ACTIONS` and `WCS_ACTIONS` arrays; the existing export, import and test-mode code is generic over the action list and needs no change.
- Existing exported configs stay valid. Only action names that were already unknown to the tool are newly recognised on import.
- Closes #4, #6 and #12 once shipped.
