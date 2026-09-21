## Context

The page already has a collapsible documentation block (`docsExpanded`) with a "Troubleshooting Common Issues" heading and four paragraphs (device not detected, axis offsets, multiple controllers, axes not working in game). The README lists a Linux path (`~/.local/share/...`) that #9 reports as wrong; #9 gives a `compatdata/1890860` path, while other user reports give `compatdata/1874880`. These two disagree, so neither is verified.

## Goals / Non-Goals

**Goals:**
- One place, on the page, with the answers to repeated questions.

**Non-Goals:**
- Supporting individual setups or making the page a full manual.
- Detecting the platform and rewriting instructions automatically.

## Decisions

- **Static content grouped by symptom** in the existing docs block, as collapsible items. Alternative: a separate docs page. Rejected: the page is single-view and users are already there when stuck.
- **Topics to cover:** browser differences (mostly Firefox failing detection, one report of the opposite); `.conf` versus `.conf.txt`; the Controllers tab; OneDrive-redirected Documents; restart or switch to a copy; Windows calibration; the Moza and vendor software running in the background; HidHide, vJoy and x360ce; Linux and Proton (path, hidraw launch option, protontricks fix for pegged axes); the game's "Hotas collective type" setting; head tracking instead of freelook; how to find action names by rebinding a key in game and reading the saved settings; a corrupt install as a last resort.
- **Verified versus reported.** Verified facts are stated plainly, and unverified ones carry a "reported by users" label so the page does not overpromise.
- **README and app share the same path text**, kept in one constant or one copied block so they cannot drift.

## Risks / Trade-offs

- [Content goes stale as the game and browsers change] → date-stamp the section, keep entries short, and include the game version where a fix depends on it.
- [Wrong Linux path published] → verify on a real install before editing; if it cannot be verified, state both paths as reported.
- [Long page] → collapsible entries, and the section stays inside the existing collapsed docs block.

## Open Questions

- The correct Steam app id in the Linux path (#9 versus the other reports). Must be checked on a Linux install; the answer only changes one line of text.
