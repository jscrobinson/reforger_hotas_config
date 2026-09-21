## Why

Users repeatedly ask for a ready config for their device: X52, X56, T16000M with TWCS, T.Flight Hotas One, Warthog, Virpil, VKB and VelocityOne came up most. The tool offers two templates (Logitech Extreme 3D Pro and Saitek X56), so most users start from nothing.

## What Changes

- Replace the two hard-coded template buttons with a list read from a manifest, so a profile is added by dropping a `.conf` and a manifest entry in `public/vanilla_configs`.
- Describe each profile: device name, what it covers (stick, throttle, pedals), where it came from, and the game version it was checked on.
- Add contributor guidance for submitting a profile: it must be a config that has worked in game, must not contain personal data, and states the device model.
- Show a notice when a profile expects more devices than are connected, since joystick numbers must match (see `handle-device-numbering-and-order`).

## Capabilities

### New Capabilities
- `starter-profiles`: how starter profiles are listed, described, loaded and accepted.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: the template buttons and `loadVanillaConfig`.
- `public/vanilla_configs/`: a manifest file next to the existing `.conf` files.
- `README.md` or a contributing note: how to submit a profile.
- The tool does not create profiles. Each new one has to come from a tested config for real hardware.
