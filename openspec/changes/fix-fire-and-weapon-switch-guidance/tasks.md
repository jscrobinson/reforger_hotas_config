## 1. Verify in game

- [ ] 1.1 Test a WCS helicopter with only `TurretFire` + `VehicleFire` bound versus all four fire actions on one button; record which one fires once, sticks, or works
- [ ] 1.2 Test the shared weapon-switch button (tap versus about 0.5 s press) on a vanilla helicopter and a WCS helicopter; record the result
- [ ] 1.3 Write the verified recipe into the GitHub issue and adjust `specs/binding-guidance/spec.md` if the results differ from it

## 2. Update the guidance

- [ ] 2.1 Split the fire note in `ACTION_NOTES` per situation and remove the "all four on one button" wording; verify in the browser at each fire step
- [ ] 2.2 Rewrite the weapon-switch note per 1.2 and make sure every action it names exists; verify in the browser
- [ ] 2.3 Restrict `sharedInput` suggestions to the verified group; verify no suggestion appears at unrelated steps
- [ ] 2.4 Update the four fire hints and the `CharacterNextWeapon` / `TurretNextWeapon` hints; verify with `npm run build` and a search for the old phrase

## 3. Verify

- [ ] 3.1 Walk through the configuration once as an on-foot and a helicopter user and verify the notes read correctly and no removed row breaks loading an old config
