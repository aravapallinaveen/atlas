# Phase 3 — Polish, Hardening, Rehearsal & Delivery

## Goal
Turn a requirement-complete product into a flawless, de-risked stage demo and a submitted entry. Freeze the layout, polish the three hero visuals, record fallback screencasts of each hero question and a 30-second "wifi-death" backup, rehearse the run three times, and prepare the submission. After 3:45, nothing new is added — unfinished work is cut, not debugged.

## Scope
- **In scope:**
  - Freeze the front-end layout; polish the three hero visuals (especially the HQ2 shortest-path animation).
  - Record a fallback screencast of each hero question working end-to-end.
  - Record a 30-second full-flow backup video in case wifi dies on stage.
  - Rehearse the demo run 3× (the fixed three-question path + the Upgrade/payment moment).
  - Prepare the submission (the "why each tool is load-bearing" write-up, the HQ2 wow moment, the Butterbase payment / $200 best-use case).
- **Out of scope / stretch (only if green by ~3:30):**
  - Open text-to-Cypher (the one-flag stretch).
  - Cognee memory, Daytona bonus tracks.
- **Hard rule:** no new scope after 3:45. Unfinished work gets cut, not debugged.

## Prerequisites & Dependencies
- **Phase 2 complete:** RocketRide swapped in with the gateway fallback, all three tools load-bearing, and payment live.
- All three hero questions pass end-to-end via RocketRide.

## Tech, Tools & Components
- A screen-recording tool (for the fallback screencasts + the wifi-death backup).
- The existing stack — **no new services**.
- Stretch only: the text-to-Cypher flag (off by default), Cognee, Daytona.

## Task Breakdown

### Polish (Person A)
- [ ] Polish the three hero visuals; make HQ2's `shortestPath` highlight clean and legible.
- [ ] Freeze the layout — no further UI changes after this point.
- [ ] Sanity-check the answer pane + graph render on the actual demo machine and screen resolution.

### Backups & de-risking (Person A)
- [ ] Record a fallback screencast of each hero question (HQ1, HQ2, HQ3) working end-to-end.
- [ ] Record a 30-second full-flow backup video for a total-wifi-failure contingency.

### Verification & rehearsal (all)
- [ ] Re-run all three hero questions and confirm answers are identical via RocketRide.
- [ ] Confirm the payment flow (Upgrade → checkout with `ENJOY0707` → unlock) still works cleanly.
- [ ] Rehearse the demo run 3× end-to-end (login → 3 hero questions → hit Free cap → Upgrade → payment).

### Stretch (only if green by ~3:30)
- [ ] (Optional) Enable open text-to-Cypher behind its flag and test one safe question.
- [ ] (Optional) Wire a Cognee memory or Daytona bonus track.

### Submission (Person C / whoever is free)
- [ ] Write the submission: the one-breath "why each tool is load-bearing," the wow moment (HQ2), and the Butterbase payment / $200 best-use case.
- [ ] Prepare any required links, repo, and video for submission.

## Deliverables / Definition of Done
- A frozen, polished UI; the three hero questions demo flawlessly via RocketRide (gateway fallback ready).
- Fallback screencasts for each hero question + a 30-second wifi-death backup video.
- The demo rehearsed 3×; the payment flow confirmed live.
- The submission prepared and ready to send.
- **Done means:** you can walk on stage, run the rehearsed path, and — even if wifi or RocketRide dies — fall back to the gateway or the recordings without breaking the demo.

## Acceptance Criteria / How to Verify
- Full dry run: login → HQ1 → HQ2 (path lights up) → HQ3 → hit the Free cap → Upgrade → checkout with `ENJOY0707` → unlocked — completes cleanly 3× in a row.
- Kill wifi mid-rehearsal → the backup recording covers the flow.
- Force `AGENT_BACKEND=gateway` → the demo still runs (fallback verified).
- Submission materials reviewed and complete.

## Risks & Mitigations
- **Wifi / network failure on stage** → a 30-second full-flow backup video + per-question screencasts recorded in advance; the gateway fallback covers a RocketRide outage.
- **Over-polishing past the freeze** → hard 3:45 cutoff; after it, cut unfinished work rather than debug it.
- **Stretch goals destabilizing a working demo** → stretch items are strictly gated on "green by 3:30" and live behind flags; if anything wobbles, revert to the frozen build.

## Estimated Effort
- **~1–1.25 hours wall-clock (≈3:15–4:30):**
  - Polish + recordings: ~3:15–3:45.
  - Rehearsal + submission: ~3:45–4:30.

## Handoff to Next Phase
Terminal phase — hands off to the live demo and submission. The deliverable is a rehearsed, backup-protected, submitted entry with a one-flag fallback, ready to present.
