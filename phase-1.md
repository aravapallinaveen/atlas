# Phase 1 — Foundation & End-to-End Slice on the Butterbase Gateway

## Goal
Stand up all three workstreams and wire the three hero questions end-to-end so that clicking a question chip runs the real pre-written Cypher on Neo4j (via Butterbase's `runGraphQuery` function), gets the answer text from the Butterbase AI gateway, and renders the answer plus the returned subgraph. When this phase is done you have a **complete, demoable product** — a login-gated app that answers all three hero questions with a lit-up graph path — that works even if RocketRide never ships. This is the "we can demo regardless" milestone (~1:30).

## Scope
- **In scope:**
  - React front-end: answer/chat pane + `react-force-graph` visualization, three clickable hero-question chips, and a (visible-but-inert) free-text box.
  - Neo4j Aura instance seeded with the ~45-node synthetic company graph (the provided Cypher), with all three hero queries verified by hand in Aura Browser.
  - Butterbase: email/password auth gating the whole app; DB tables for `users`, `saved_questions`, and a per-user `queries_used` counter; the `runGraphQuery(id)` server-side function (using `neo4j-driver`, credentials server-side) that maps a `queryId` → pre-written Cypher → `{rows, subgraph}`.
  - `askAgent(question, rows)` with **only** the gateway implementation, behind the `AGENT_BACKEND` env var (default = `gateway`).
  - End-to-end flow for all three hero questions: chip → `runGraphQuery` → `askAgent(gateway)` → render answer + subgraph, with HQ2's shortest path highlighted.
- **Out of scope (deferred to a later phase):**
  - RocketRide Cloud endpoint and the backend swap → Phase 2.
  - Payment / Free⇄Pro gating → Phase 2.
  - Open text-to-Cypher (off by default; stretch only).
  - Cognee memory, Daytona (optional bonus tracks; Phase 3 only if green by ~3:30).
  - Visual polish, layout freeze, and backup recordings → Phase 3.

## Prerequisites & Dependencies
This is the starting phase, so these are the starting conditions and setup:
- Access provisioned: Neo4j Aura (free tier), a Butterbase account with AI gateway access, a shared GitHub repo, and a working Node.js toolchain.
- Three-person team assigned: **A** = front-end, **B** = Neo4j + RocketRide, **C** = Butterbase.
- The seed Cypher and the three hero queries in hand (provided).
- In parallel (de-risking Phase 2, not required to finish Phase 1): B attends the 10:15 RocketRide workshop and attempts a throwaway hello-world deploy to prove the deploy path.

## Tech, Tools & Components
- **Front-end:** React, `react-force-graph` (use off the shelf — do not hand-roll graph rendering).
- **Graph DB:** Neo4j Aura, Cypher, `neo4j-driver` (invoked server-side inside the Butterbase function only).
- **Backend / API / Auth / DB:** Butterbase — auth, DB, the `runGraphQuery(id)` function, and the AI gateway for the LLM answer.
- **Decoupling flag:** `AGENT_BACKEND = gateway | rocketride` (defaults to `gateway` this phase).

## Task Breakdown
The three workstreams run in parallel. Group tasks by owner.

### Front-end (Person A)
- [ ] Scaffold the React app (Vite or CRA); commit repo skeleton with a two-pane layout (answer pane + graph pane).
- [ ] Install and wire `react-force-graph`; render a hardcoded/fake subgraph to prove the rendering path.
- [ ] Build three hero-question chips; map each to a `queryId` (`hq1` / `hq2` / `hq3`).
- [ ] Add a free-text input box — visible but inert for now (open text-to-Cypher stays off).
- [ ] Wire chip click → call Butterbase `runGraphQuery(id)` → receive `{rows, subgraph}`.
- [ ] Replace the fake data: render the real returned subgraph.
- [ ] Wire the answer pane to call `askAgent(question, rows)` and display the returned answer text.
- [ ] Implement path/subgraph highlighting for **HQ2** (the `shortestPath` marquee visual).

### Neo4j (Person B)
- [ ] Create the Neo4j Aura instance; capture the connection URI + credentials (store server-side only).
- [ ] Run the provided seed Cypher (`MATCH (n) DETACH DELETE n;` then the `CREATE …` block) in Aura Browser.
- [ ] Sanity-check counts (~45 nodes; teams, people, services, projects, tasks, decisions all present).
- [ ] Verify **HQ1** (blast radius / fan-out) returns Sam + `{Checkout, Notifications}`.
- [ ] Verify **HQ2** (`shortestPath`) returns Checkout Revamp → Checkout → Pipeline → Priya → Data Platform.
- [ ] Verify **HQ3** (blocker chain) returns root task "Migrate to new Gateway" + Sam.
- [ ] (Parallel de-risk) Deploy a throwaway hello-world RocketRide pipeline to prove the deploy path.

### Butterbase (Person C)
- [ ] Set up the Butterbase project; configure email/password auth; gate the entire app behind login.
- [ ] Create the DB schema: `users`, `saved_questions`, `queries_used` (per-user counter).
- [ ] Implement `runGraphQuery(id)`: map `queryId` → pre-written Cypher, execute via `neo4j-driver` server-side, return `{rows, subgraph}`.
- [ ] Wire the three hero queries into `runGraphQuery` (`hq1` / `hq2` / `hq3` → known-good Cypher).
- [ ] Implement the `askAgent(question, rows)` **gateway** path: call the Butterbase AI gateway with the Atlas prompt, return `{answer}`.
- [ ] Add a "save this answer" button → writes a row to `saved_questions` (a visible DB write).
- [ ] Increment `queries_used` on each query (counter wired now; enforcement comes in Phase 2).

### Integration checkpoints
- [ ] **~11:45 GO/NO-GO:** login works · graph seeded · trivial RocketRide pipeline deployed (or Discord escalation started). Proceed regardless of RocketRide status.
- [ ] **~1:30 milestone:** all three hero questions run chip → `runGraphQuery` → gateway answer → rendered subgraph. Full demo exists.

## Deliverables / Definition of Done
- A login-gated React app where clicking each of the three hero chips returns a correct natural-language answer (via the gateway) and renders the matching subgraph, with HQ2's path highlighted.
- A seeded, hand-verified Neo4j Aura graph.
- Butterbase auth + DB + `runGraphQuery` function + gateway `askAgent`, all wired end-to-end.
- A working "save answer" button that performs a visible DB write.
- **Done means:** you could stand up and demo all three hero questions end-to-end using only Butterbase + Neo4j, with zero dependence on RocketRide.

## Acceptance Criteria / How to Verify
- Log in → click **HQ1** → answer names Sam + Checkout & Notifications; the Billing-centered subgraph renders.
- Click **HQ2** → answer names the Pipeline/Priya path; the path lights up across the graph.
- Click **HQ3** → answer names "Migrate to new Gateway" + Sam; the blocker chain traces to the root node.
- Click "save answer" → a new row appears in `saved_questions`.
- Confirm Neo4j credentials appear only server-side (grep the front-end bundle to be sure they don't leak).

## Risks & Mitigations
- **Graph viz / path-highlight time sink** → use `react-force-graph` off the shelf; if custom highlighting lags, just render the returned subgraph (it still clearly shows a traversal). Never hand-roll rendering.
- **RocketRide deploy path is an unknown and steals focus** → time-box the hello-world deploy to parallel effort; it is **not** a Phase 1 blocker; escalate on Discord early if it stalls.
- **Neo4j credentials leaking into the client** → keep all Cypher execution inside the Butterbase `runGraphQuery` function; the front-end only ever calls the function, never the driver.

## Estimated Effort
- **~2.5 hours wall-clock (≈11:00–1:30)** across three people in parallel.
  - Front-end wiring is the critical path.
  - Neo4j seed + verify: ~40 min.
  - Butterbase auth + DB + function: the other main track.

## Handoff to Next Phase
Hands off a **fully working, demoable product on the Butterbase gateway** with a stable `askAgent(question, rows)` seam behind `AGENT_BACKEND`. This unlocks Phase 2: swap the reasoning backend to RocketRide by flipping one env var, and add the payment gate — both without touching the front-end contract.
