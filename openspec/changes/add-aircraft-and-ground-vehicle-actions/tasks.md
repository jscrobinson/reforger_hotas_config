## 1. Investigate

- [ ] 1.1 List the fixed-wing action names and default presets from the game's own configuration; save the list in the issue
- [ ] 1.2 List the ground-vehicle actions the same way and test whether a real pedal or wheel axis works for them; record the result
- [ ] 1.3 Confirm the A-10 mod's action names from the mod's data, or drop that group

## 2. Group mechanism

- [ ] 2.1 Replace `wcsActionsEnabled` and `WCS_ACTIONS` with a group list and enabled set in `src/App.vue` with WCS as the first group; verify the WCS behaviour is unchanged
- [ ] 2.2 Make the rebuild watcher group-aware and keep bindings by name; verify toggling groups keeps other bindings
- [ ] 2.3 Add group switches with the mod name and requirement text; verify they render

## 3. Groups

- [ ] 3.1 Add the fixed-wing group from 1.1; verify each action appears and exports
- [ ] 3.2 Add the ground-vehicle group from 1.2; verify an axis binding is written
- [ ] 3.3 Add the mod group from 1.3 if confirmed; verify it is off by default

## 4. Verify

- [ ] 4.1 Run `npm run build` and load a config with one action per group in game; report the result in the issue
