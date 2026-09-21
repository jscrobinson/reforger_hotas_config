## Context

`pollGamepads` in `src/App.vue` calls `navigator.getGamepads()` every frame and lists whatever the browser returns. There is no `gamepadconnected` listener and no path for a device the browser omits. The empty-state text says "Connect a joystick and press any button".

By the Gamepad API's design, a browser may withhold a device until the user interacts with it, and browsers differ in what counts as interaction. The reports point to axis-only devices in particular, and mostly to Firefox, with one user finding the reverse. The exact rule per browser is a hypothesis, not confirmed.

## Goals / Non-Goals

**Goals:**
- Give users a way to succeed when the browser does not show a device.

**Non-Goals:**
- Reading devices through anything other than the browser Gamepad API (no native helper).
- Reading virtual devices such as vJoy in place of a physical one; that is a separate request (#13).

## Decisions

- **Guidance plus a manual fallback, not a detection rewrite.** No code change can force a browser to list a device, so the fix is honesty and a fallback. Alternative considered: a `gamepadconnected` listener. The polling loop already sees the device as soon as the browser lists it, so the listener adds nothing here.
- **Manual device = a joystick number with no live state.** Its inputs are typed using the manual entry from `custom-actions-and-lossless-import`. The device list marks it as manual so users do not expect live input.
- **Show the hint conditionally** to avoid noise for people whose devices work.

## Risks / Trade-offs

- [The wake-up hypothesis is wrong for some devices] → phrase it as "may", keep the troubleshooting list broader than the hypothesis, and ask reporters with a real pedal set to confirm.
- [Users type wrong axis numbers] → show the game-side syntax with an example, and validate the format.
- [Manual entry duplicates the custom-input feature] → build it on that feature and add only the device-slot UI here.

## Open Questions

- Whether pressing the axes alone wakes the device in Chrome and Edge on Windows. Confirm with a physical axis-only device before finalising the hint wording.
