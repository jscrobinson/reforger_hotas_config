## Context

`ACTIONS` and `WCS_ACTIONS` are two constants in `src/App.vue`; `wcsActionsEnabled` and a watcher rebuild `state.actions` from them, keeping existing bindings by name. This is a two-set design. PR #11 (closed) tried adding vehicle actions and its author reported that real pedals could not be bound, likely because of how the game treats those axes.

User-reported names that need checking, none verified: an A-10 mod's `PFC_Pitch`, `PFC_Roll`, `PFC_Yaw`, `PFC_ThrottleUp`, `PFC_ThrottleDown`, `AWENZJ_FlapsToggle`, `AWENZJ_AirbrakeToggle` and several `Awenzj_Scorpion*` actions. The game's own fixed-wing action names have not been collected.

## Goals / Non-Goals

**Goals:**
- A group mechanism that scales to more sets.
- Verified names for each group before it ships.

**Non-Goals:**
- Guessing action names from user posts.
- Covering every mod.

## Decisions

- **Group list with one flag per group.** Replace the single WCS flag with a list of `{ id, label, actions, requires }` entries and a set of enabled ids. Alternative: a boolean per mod. Rejected: it repeats the watcher code for each one.
- **Names from game data.** Copy names from the game's own configuration (Workbench or a config saved by rebinding a key), never from a user's post.
- **Ship group by group.** The mechanism first with WCS as the only group; then fixed-wing; then ground vehicles; then any mod group. Each can be merged and released separately.
- **Ground vehicles need an axis check first.** Verify that a real pedal or wheel axis works as an input for those actions before promising it.

## Risks / Trade-offs

- [Unverified or mistyped names silently do nothing in game] → only add verified names, and record the source in a code comment.
- [Long walkthrough] → groups are off by default.
- [Mod names change between mod versions] → label the group with the mod name and note the version checked.

## Open Questions

- Whether the fixed-wing actions live in one game input context or several; affects how they are grouped but not whether they are offered.
