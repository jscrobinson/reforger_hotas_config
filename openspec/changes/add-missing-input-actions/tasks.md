## 1. Verify names and presets

- [x] 1.1 Check `VONDirect` spelling and `WCS_Armament_ConfirmLock` FilterPreset against a real in-game config (rebind the key in game, read the saved `InputUserSettings`); record the result in a comment on the new rows (confirmed by the maintainer: `VONDirect` spelling, `WCS_Armament_ConfirmLock` name and FilterPreset `pressed`)
- [x] 1.2 Check whether the ripple-quantity action is `TurretNextRippleQuantity` or `TurretWeaponNextRippleQuantity` and note the answer in the issue (confirmed by the maintainer: `TurretWeaponNextRippleQuantity`, the tool's current name)

## 2. Add the actions

- [x] 2.1 Add `VehicleNextWeapon`, `SwitchCameraType` and `VONDirect` to `ACTIONS` in `src/App.vue`; verify with `npm run build`
- [ ] 2.2 Add `WCS_Armament_ConfirmLock` to `WCS_ACTIONS`; verify it appears only when WCS actions are ticked
- [ ] 2.3 Correct the `VONDirectToggle` hint; verify the wording in the browser
- [x] 2.4 If 1.2 shows the name is wrong, rename the ripple-quantity row and map the old name on import; verify an old config still loads (not needed, name is correct)

## 3. Verify end to end

- [ ] 3.1 Bind each new action, download the config, and verify the `.conf` has an `Action` block per name
- [ ] 3.2 Load that config back and verify every binding reappears; also load a vanilla template and verify nothing changed
