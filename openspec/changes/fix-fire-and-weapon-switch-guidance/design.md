## Context

`ACTION_NOTES` in `src/App.vue` currently holds two shared-input notes: one for `CharacterFire`, `TurretFire`, `HelicopterFire` and `VehicleFire`, and one for `CharacterNextWeapon` and `TurretNextWeaponHold`. `bindingSuggestion` offers to copy a binding from any listed action already bound. Recent changes already reworked the `TurretNextWeapon` / `TurretNextWeaponHold` notes, so the remaining problem is the two shared-input notes.

The evidence is user reports, and it conflicts: some say bind all fire actions to one button, two experienced users say bind only `TurretFire` and `VehicleFire`, and one user fixed a non-firing setup by making a new config with fewer bound actions. Nothing here has been verified in game yet.

## Goals / Non-Goals

**Goals:**
- Make the guidance match what actually works in game.

**Non-Goals:**
- Changing the exported config format or FilterPresets (except where verification proves a preset wrong).
- Adding new actions (see `add-missing-input-actions`).

## Decisions

- **Verify first.** Task 1 tests the reported recipe in game before any wording changes. The spec text above assumes the recipe is confirmed; if it is not, the requirements are adjusted before implementation.
- **Scope notes by situation.** Split the fire note into on foot, vanilla helicopter or turret, and WCS helicopter. Alternative considered: one short note saying "bind fewer fire actions". Rejected because users need to know which ones.
- **Reuse `sharedInput` only for genuinely shared actions**, so the copy suggestion stays but applies to the smaller verified set (for example the weapon-switch group).
- **Do not remove fire rows.** Old configs that contain them must keep loading; the notes tell users to leave them empty.

## Risks / Trade-offs

- [Guidance changes to something that is also wrong] → require an in-game test result, written into the issue, before merge.
- [Situations differ by server or mod version] → word the notes as "for WCS helicopters" rather than universal, and keep the wording easy to edit.
- [Users with working all-same-button configs are told to change] → phrase the note as a fix for stuck or repeating fire, not as a requirement.

## Open Questions

- Is a long press (about 0.5 s) required for the shared weapon-switch button, or only helpful? This decides whether the tool should also pick a hold FilterPreset for it. It can be settled during verification without changing the task list.
