## 1. Wording

- [ ] 1.1 Rewrite the calibration checkbox label and instruction block in `src/App.vue` to state that only the tool is affected; verify in the browser
- [ ] 1.2 Fix the "adjust for offset center points" sentence in the troubleshooting section; verify no text claims the config is corrected
- [ ] 1.3 Add the partial-range troubleshooting entry with the three steps; verify it renders in the documentation section

## 2. Warning

- [ ] 2.1 Compute the raw span per axis from the calibration data and show a warning when it is short; verify with a mocked axis that only spans 0 to 0.25
- [ ] 2.2 Confirm an axis with a full range and a one-directional throttle slider do not trigger a warning; verify with mocked values

## 3. Investigate (does not block the above)

- [ ] 3.1 Test whether a multiplier filter scales a helicopter axis in game; write the result in the issue

## 4. Verify

- [ ] 4.1 Run `npm run build` and re-read the calibration text once as a first-time user
