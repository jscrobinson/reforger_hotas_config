## Why

The same setup problems are asked about over and over, and most are not bugs in the tool: the file saved as `.conf.txt`, the wrong folder, the game's Controls tab instead of the Controllers tab, OneDrive-redirected Documents, an unrestarted game, the wrong browser, virtual devices in the way, and Linux and Proton specifics. The in-app troubleshooting covers only a few of these, and the README's Linux path is reported as wrong (#9). Related: #7, #8.

## What Changes

- Extend the in-app troubleshooting into a "Known issues" section grouped by symptom, covering the topics listed in the design.
- Correct the Linux config path in the README and in the app after verifying it (#9).
- State the button-count limit (#7) and where it comes from once that is confirmed.
- Mark anything that has not been verified as reported by users, rather than as fact.

## Capabilities

### New Capabilities
- `known-issues-help`: the troubleshooting content the app and README provide and what it must cover.

### Modified Capabilities
<!-- none: no specs exist yet -->

## Impact

- `src/App.vue`: the collapsible documentation and troubleshooting block.
- `README.md`: Linux save location.
- Content only; no change to detection or export.
- The other changes in this batch link to entries here for the parts they cannot fix in code.
