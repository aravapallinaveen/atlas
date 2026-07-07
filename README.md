# Atlas — Ask your company graph

Atlas turns a company's knowledge graph — people, teams, services, projects, tasks, and
decisions — into plain-language answers. Ask a question, and Atlas runs a real graph query,
lights up the matching subgraph, and explains the answer.

## 🔗 Live demo

### **https://atlas.butterbase.dev**

Sign in with the demo account:

| | |
|---|---|
| **Email** | `atlas.demo@gmail.com` |
| **Password** | `AtlasDemo2026!` |

> _Demo account — already on the **Pro** plan, so you get the full experience (unlimited
> questions + full graph). To see the **Free → Pro upgrade** moment, **Sign up** a fresh
> account instead — it starts on Free with a 5-question cap._

## What it does — three hero questions

Click a suggested question and watch the graph light up:

- **HQ1 · Blast radius** — _"If Sam ships a change to Billing, what gets affected?"_ → Checkout + Notifications.
- **HQ2 · Shortest path** — _"How is the Checkout Revamp connected to the Data Platform team?"_ → the path animates: Checkout Revamp → Checkout → Pipeline → Priya → Data Platform.
- **HQ3 · Blocker chain** — _"Why is the Checkout Revamp blocked?"_ → traces to the root task "Migrate to new Gateway" (owned by Sam).

## Three load-bearing tools

Remove any one and the product breaks:

| Tool | Role |
|---|---|
| **Neo4j Aura** | The knowledge graph (~45 nodes / ~69 relationships). Every question runs real Cypher here. |
| **Butterbase** | Auth · Postgres DB · serverless functions · AI gateway · **and hosting**. |
| **RocketRide** | The production reasoning step (`AGENT_BACKEND=rocketride`), with the Butterbase gateway as an instant fallback. |

## Features

- 🔒 **Email/password login** gates the whole app (Butterbase Auth).
- 🕸️ **Live graph visualization** (`react-force-graph`) — the answer's subgraph lights up; HQ2's shortest path animates with directional particles.
- 🧠 **Reasoning** via RocketRide → Butterbase AI gateway, grounded in live Neo4j data.
- 💾 **Save answers** to the database.
- 💳 **Free / Pro tiers** — Free = 5 questions + partial graph; **Upgrade to Pro** (promo `ENJOY0707`, $0) unlocks unlimited questions + the full graph.

## How it works

```
Browser  (atlas.butterbase.dev)
   │  login (Butterbase Auth)
   ▼
runGraphQuery(id) ──► Neo4j Aura                         →  rows + subgraph  (graph lights up)
   │
   ▼
askAgent(q, rows) ──► RocketRide ──► Butterbase AI gateway →  answer          (plain-language)
   │
   ▼
saveAnswer · getEntitlement · upgradeToPro ──► Butterbase Postgres
```

The front-end talks to Butterbase through a few serverless functions; the graph, the LLM,
the database, and RocketRide are all hidden behind them.

## Run locally

```bash
npm install
cp .env.example .env    # VITE_APP_ID + VITE_API_URL, VITE_USE_MOCK=false
npm run dev             # http://localhost:5273
```

- `VITE_USE_MOCK=true` runs the UI against in-app canned data (no account needed).
- Redeploy the hosted front-end: `npm run build && npx butterbase deploy dist --framework react-vite`.

## Backend seam

The front-end depends only on these functions ([`src/api/backend.js`](src/api/backend.js)):

```js
runGraphQuery(queryId)             // -> { rows, subgraph }     (Neo4j)
askAgent(question, rows)           // -> { answer }             (RocketRide + gateway)
saveAnswer({ question, answer })   // -> { ok, id }
getEntitlement()                   // -> { plan, queriesUsed }
upgradeToPro(promo)                // -> { ok, plan }
```

The Butterbase side — schema, functions, RLS, and the deploy runbook — lives in
[`butterbase/`](butterbase/README.md).

## Layout

```
src/
  api/            backend seam + Butterbase SDK client
  auth/           email/password auth
  data/           the ~45-node graph + the three hero questions
  components/     QuestionChips · FreeTextBox · AnswerPane · GraphPane · LoginScreen · UpgradeModal
  App.jsx, main.jsx
butterbase/       schema.json · functions/*.ts · deploy runbook
```

## Team

**A** — front-end · **B** — Neo4j + RocketRide · **C** — Butterbase.
