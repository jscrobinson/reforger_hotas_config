## Context

`parseConfig` in `src/App.vue` clears all bindings, matches `Action <name> {...}` blocks and copies inputs onto steps whose name matches; other blocks are ignored. `generateConfig` builds the file only from `state.actions`, so anything ignored on import is lost on export. Rows can already share a config action name through `SHARED_ACTION_NAMES`.

The block regex assumes the two-space indentation the game writes.

## Goals / Non-Goals

**Goals:**
- No silent data loss on import then export.
- A way to add an action or input without a text editor.

**Non-Goals:**
- A full config editor or a parser for the whole `.conf` grammar.
- Preserving content outside `Actions {}` (filters, other managers); the current output only writes actions.
- Publishing a canonical list of action names (see `add-aircraft-and-ground-vehicle-actions` and `add-missing-input-actions`).

## Decisions

- **Keep unknown blocks as raw text.** Store the matched block text keyed by name and re-emit it verbatim, rather than parsing it into rows and regenerating GUIDs. Verbatim keeps custom filters (for example a multiplier filter) intact. Alternative: parse into rows. Rejected: loses filter details that the tool does not model.
- **Custom actions are rows.** A custom action becomes an `Action` in the list with a user-given name and preset, so export and testing reuse the existing code. It goes at the end of the list.
- **Validate with allow-lists.** Names match `^[A-Za-z][A-Za-z0-9_]*$`, presets come from the `FilterPreset` union, inputs match the regular expression from the spec. Because output is a text file the game parses, anything that could break out of a quoted string or block is rejected.
- **Notice, not blocking dialog.** Loading already uses `alert`; add the count to that message rather than another prompt.

## Risks / Trade-offs

- [A kept block is malformed] → it is written as loaded, so the tool is not making it worse; the game will report it.
- [Kept block duplicates a step after a later update] → the step takes over (spec); the kept copy is dropped when a step with that name exists.
- [Typed inputs are wrong] → validation covers format only; the test mode shows whether the device produces that input.

## Open Questions

- Where the "add action" form lives in the UI. Purely presentational, decided at implementation.
