## 1. Reproduce

- [ ] 1.1 With an axis-only device (pedals), record whether each browser lists it before and after moving the axes and after a button press on another device; write the finding in the issue and adjust the wording of the hint

## 2. Guidance

- [ ] 2.1 Replace the empty-state text in the device list with the wake-up guidance and show it when fewer devices appear than expected; verify in the browser with no device connected
- [ ] 2.2 Add a collapsible "Device not listed?" section with the troubleshooting steps; verify it opens and reads correctly

## 3. Manual device (after `custom-actions-and-lossless-import` is done)

- [ ] 3.1 Add a way to create a manual device with a joystick number and show it in the list marked as manual; verify it appears after adding
- [ ] 3.2 Allow typing inputs for a manual device using the manual input entry; verify the downloaded `.conf` contains `joystick<N>:axis<M>±`

## 4. Verify

- [ ] 4.1 Run `npm run build` and load the generated config in game with a pedal set that was not detected, and report the result in the issue
