## Why

Devices with no buttons, mainly rudder pedals, often never appear in the tool: T-Rudder, TPR and TFRP, MFG Crosswind, Virpil and Moza pedals, and others. About fifteen reports name them. One user's diagnosis is that the browser exposes a gamepad only after a button press or axis movement. Related: #8, #13.

## What Changes

- Tell users up front that a device may need a button press or full axis movement before the browser lists it, and show that hint when fewer devices appear than expected.
- Add a "Device not listed?" flow that lets a user create a manual device entry (a joystick number) so its inputs can be typed in when the browser will not show it. The typed-input part is provided by `custom-actions-and-lossless-import`.
- Show the reason when an axis-only device is missing (browser, permissions, another program holding the device) as short troubleshooting steps.

## Capabilities

### New Capabilities
- `device-detection`: how the tool discovers devices and what it tells the user when one is missing.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: the connected-joysticks section, polling, the empty-state text, and a new manual-device panel.
- Depends on the manual input entry in `custom-actions-and-lossless-import`.
- Cannot make the browser expose a device it does not expose. The manual flow is the fallback.
