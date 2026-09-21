## 1. Lossless import

- [ ] 1.1 In `parseConfig`, store the raw text of each unrecognised `Action` block; verify by loading a config with an extra block and inspecting the stored value
- [ ] 1.2 Re-emit the kept blocks in `generateConfig`, skipping any whose name now has a step; verify a load, download round trip keeps the block and does not duplicate a known one
- [ ] 1.3 Include the kept count in the load message; verify the wording with 0 and with 3 kept blocks

## 2. Custom actions and typed inputs

- [ ] 2.1 Add validators for names, presets and inputs; verify with a list of valid and invalid strings, including quotes and line breaks
- [ ] 2.2 Add a form to create a custom action and append it to the action list; verify it appears as a step and exports
- [ ] 2.3 Add a typed-input field to the binding step; verify `joystick1:pov_up` is accepted and `joystick1:foo` is rejected

## 3. Verify

- [ ] 3.1 Run `npm run build`, then load a config produced by the game and one with hand-added blocks, download, and diff the action blocks to confirm nothing was lost
