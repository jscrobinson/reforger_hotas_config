## 1. Detection

- [ ] 1.1 Record the values a hat produces in the browser for two or three real devices (for example X56, T16000M, Warthog) and store them as a mapping table; verify the table covers all eight directions
- [ ] 1.2 Convert hat presses to a `pov_<dir>` input in `detectInput` and `detectTestModeInput`; verify pressing each direction shows the matching input
- [ ] 1.3 Number the second and third hat `pov2_` and `pov3_`; verify with a device that has two hats, or with a mocked gamepad
- [ ] 1.4 Stop proposing axis bindings for a hat at rest; verify no input is proposed after connecting a hat device and leaving it untouched

## 2. Select action and config

- [ ] 2.1 Add the second `SelectAction` row using `SHARED_ACTION_NAMES` with `previous` and `next` presets; verify the exported config has both inputs in one block
- [ ] 2.2 Parse `pov_*` inputs on import and show readable labels in the UI; verify a config with `joystick0:pov_up` reloads

## 3. Verify

- [ ] 3.1 Bind freelook to a hat, download, and confirm in game that the camera no longer sticks; report the result in the issue
- [ ] 3.2 Load a config that uses `axis9+` for a hat and verify it still loads, and run `npm run build`
