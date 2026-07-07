# Phase 2 — RocketRide Reasoning Swap + Payment Gate

## Goal
Make all three mandatory tools genuinely load-bearing and satisfy every scoring gate. Build the tiny one-node RocketRide Cloud pipeline that turns `{question, rows}` into the answer sentence, deploy it, and flip `AGENT_BACKEND=rocketride` so the production reasoning step runs on RocketRide — with the gateway kept as an instant fallback. Then wire the Butterbase payment gate: Free (5 queries + partial graph) ⇄ Pro (unlimited + full graph) via Butterbase checkout with promo `ENJOY0707`. When this phase is done, removing any one of Neo4j / RocketRide / Butterbase breaks the product, and the non-negotiable payment requirement is satisfied visibly on stage.

## Scope
- **In scope:**
  - RocketRide: a single-node pipeline — input `{question, rows}` → one LLM call (the Atlas prompt) → output `{answer}` — deployed to RocketRide Cloud and callable.
  - The `askAgent` **rocketride** implementation behind `AGENT_BACKEND`; flip the default to `rocketride`; keep the gateway path intact as fallback.
  - Verify RocketRide answers match the gateway answers for all three hero questions.
  - Butterbase payment: Free vs Pro tiers. Free = 5-query cap (enforced via `queries_used`) + partial/capped graph view. "Upgrade to Pro" → Butterbase checkout (promo `ENJOY0707`, Launch plan) → unlocks unlimited queries + full graph.
  - Enforce the query cap and the partial-vs-full graph gating in the UI.
- **Out of scope (deferred to a later phase):**
  - Visual polish, layout freeze, rehearsal, backup recordings → Phase 3.
  - Open text-to-Cypher, Cognee, Daytona (stretch only).

## Prerequisites & Dependencies
- **Phase 1 complete:** a working gateway demo, the `askAgent` seam behind `AGENT_BACKEND`, Butterbase auth + DB + `runGraphQuery`, and a seeded Neo4j graph.
- A RocketRide account with the hello-world deploy path already proven in Phase 1 (or the escalation resolved).
- Butterbase payment/checkout enabled and the promo code `ENJOY0707` available.

## Tech, Tools & Components
- **RocketRide Cloud** — the deployed single-node LLM pipeline; the agent's reasoning step in production.
- **Butterbase payment/checkout** + plan config; the same DB (`queries_used`, plus a plan/entitlement flag per user).
- **Decoupling flag:** `AGENT_BACKEND = gateway | rocketride` (flips to `rocketride` this phase).

## Task Breakdown

### RocketRide pipeline (Person B)
- [ ] Build the one-node pipeline: input `{question, rows}`; a single LLM call with the Atlas prompt — *"You are Atlas. Given the user's question and these graph results (JSON), answer in 2–3 sentences, naming the specific people/services/tasks and the connecting path."*; output `{answer}`.
- [ ] Deploy the pipeline to RocketRide Cloud; obtain the callable endpoint.
- [ ] Smoke-test the endpoint with a saved `{question, rows}` payload captured from each hero question.

### Integration / the swap (Person B + C)
- [ ] Implement the `askAgent` **rocketride** path: POST `{question, rows}` to the RocketRide endpoint, return `{answer}`.
- [ ] Flip `AGENT_BACKEND=rocketride`; keep the gateway implementation intact as fallback.
- [ ] Confirm all three hero answers via RocketRide are correct and match the gateway versions.
- [ ] Verify the one-line rollback: setting `AGENT_BACKEND=gateway` restores the gateway path instantly.

### Payment (Person C — discrete ~20 min slice, do NOT skip; this is the DQ gate)
- [ ] Configure the **Free** tier: cap at 5 queries (enforced via `queries_used`) + partial/capped graph view.
- [ ] Configure the **Pro** tier: unlimited queries + full graph.
- [ ] Add "Upgrade to Pro" → Butterbase checkout flow with promo `ENJOY0707` (Launch plan).
- [ ] On successful checkout, flip the user's entitlement → unlock unlimited queries + full graph.
- [ ] Enforce gating in the UI: Free users see the cap + partial graph; Pro users see everything.

## Deliverables / Definition of Done
- A deployed, callable RocketRide pipeline producing the answer text; `AGENT_BACKEND=rocketride` in effect with the gateway retained as fallback.
- All three hero questions answered via RocketRide, matching the gateway output.
- A working Free⇄Pro payment flow: clicking Upgrade completes a Butterbase checkout with `ENJOY0707` and unlocks unlimited + full graph, live.
- **Done means:** each of the three mandatory tools is load-bearing (remove any one → the product breaks) **and** payment is satisfied visibly on stage.

## Acceptance Criteria / How to Verify
- With `AGENT_BACKEND=rocketride`, run all three hero questions → correct answers served via RocketRide.
- Flip to `gateway` and back → answers unchanged (fallback proven).
- As a Free user, hit the 5-query cap → blocked / prompted to upgrade; the graph shows only the partial view.
- Click Upgrade → complete Butterbase checkout with `ENJOY0707` → unlimited queries + full graph unlock in the same session.
- Confirm the "remove any tool breaks it" story end-to-end: no RocketRide → no answer text (or fallback); no Neo4j → no rows; no Butterbase → no auth/API/payment.

## Risks & Mitigations
- **RocketRide eats the afternoon** → the app already runs on the gateway (Phase 1), so you demo regardless. Plan B: route just one call through any single-node RocketRide pipeline to clear the gate and keep everything else on the gateway. Escalate on Discord early.
- **Answer drift between the two backends** → keep the RocketRide prompt byte-identical to the gateway prompt; verify each hero answer matches before switching the default.
- **Payment forgotten (DQ)** → it is a discrete, owned, ~20-minute slice with its own checklist. One Upgrade button + a sandbox/promo checkout satisfies it — do not let it slip.

## Estimated Effort
- **~1.5–1.75 hours wall-clock (≈1:30–3:15)** in parallel:
  - RocketRide build + deploy + swap on one track.
  - The payment gate (~20 min) on another.

## Handoff to Next Phase
Hands off a product that **meets every scoring requirement** — all three tools load-bearing, payment live — running on RocketRide with a one-flag gateway fallback. This unlocks Phase 3: freeze scope and focus entirely on polish, rehearsal, and delivery/backups.
