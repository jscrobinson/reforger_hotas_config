## 1. State and export

- [ ] 1.1 Add an export-number map and an ignored-device set to app state in `src/types/index.ts`; verify with `npm run build`
- [ ] 1.2 Apply the map in `generateConfig` when writing `joystickN`; verify by swapping two devices and reading the downloaded `.conf`
- [ ] 1.3 Skip ignored devices in detection and in the binding list; verify pressing their buttons creates no binding

## 2. Interface

- [ ] 2.1 Add per-device controls to the "Connected Joysticks" list for export number, ignore and reset; verify each in the browser
- [ ] 2.2 Show 1-based button numbers with the config value in the input visualisations and in binding labels; verify button 1 shows "Button 1 (button0)"

## 3. Loading

- [ ] 3.1 After `parseConfig`, list joystick numbers that have no connected device and show a message; verify with a config that binds `joystick3`

## 4. Verify

- [ ] 4.1 With two real or mocked devices, swap numbers, download, load the file in game and confirm the bindings follow the swap; report the result in the issue
