## Why

Users keep reporting fire and weapon-switch problems: fire that never stops, one shot and then nothing, the weapon advancing several steps per tap, and the wrong weapon firing. Two experienced users say the fix is to bind only `TurretFire` and `VehicleFire`, and to put the weapon-switch actions on one button with a long press. The tool currently tells users to bind all four fire actions and all weapon-switch actions to the same button, which is the opposite. Related: #4.

## What Changes

- Replace the "bind all four fire actions to the same trigger" note with guidance per situation (on foot, vanilla helicopter or turret, WCS helicopter), once the recipe is verified in game.
- Stop offering to copy one fire binding onto every other fire action when that is not the verified recipe.
- Rewrite the weapon-switch note to match the verified recipe, including the long-press behaviour and which actions share a button.
- Update the row hints that say "use same trigger as all fire actions".

## Capabilities

### New Capabilities
- `binding-guidance`: the advice the tool shows while a user binds fire and weapon-switch actions, and when it offers to reuse a binding.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: `ACTION_NOTES`, the `sharedInput` suggestion logic, and hints on `CharacterFire`, `TurretFire`, `HelicopterFire`, `VehicleFire`, `CharacterNextWeapon` and `TurretNextWeapon`.
- `src/types/index.ts`: `ActionNote` only if notes need to be scoped per situation.
- No change to exported config format.
- Depends on `add-missing-input-actions` for the `VehicleNextWeapon` row that the weapon-switch advice mentions.
