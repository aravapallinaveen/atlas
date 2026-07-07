# Atlas

Ask your company graph in plain language. Atlas answers questions about how people,
teams, services, projects, tasks, and decisions connect — running a real graph query,
lighting up the matching subgraph, and explaining the answer.

Built on three load-bearing tools: **Neo4j** (the graph), **Butterbase** (auth, DB, the
`runGraphQuery` function + AI gateway), and **RocketRide** (the reasoning step, Phase 2).

## Status — Phase 1

**Front-end (Person A)** and **Butterbase backend (Person C)** are done and wired end-to-end
on the live Butterbase app. Neo4j (Person B) drops in behind an unchanged function.

- Email/password login gates the whole app (Butterbase Auth).
- Two-pane layout: answer/chat pane + `react-force-graph` visualization.
- Three hero-question chips (HQ1 / HQ2 / HQ3) → each maps to a `queryId`.
- An inert free-text box (open text-to-Cypher stays off for now).
- Chip click → `runGraphQuery(id)` (Butterbase fn) → render the subgraph → `askAgent(question, rows)` (AI gateway) → answer.
- HQ2's shortest path is highlighted (amber path + directional particles).
- "Save answer" writes a row to `saved_questions`; every query bumps a per-user `queries_used` counter.

## Run it

```bash
npm install
cp .env.example .env    # set VITE_APP_ID + VITE_API_URL (VITE_USE_MOCK=false)
npm run dev             # http://localhost:5273  (sign up, then ask a question)
```

Set `VITE_USE_MOCK=true` to run the front-end against in-app canned data with no account.

## Backend seam

The front-end depends ONLY on three functions in [`src/api/backend.js`](src/api/backend.js):

```js
runGraphQuery(queryId)            // -> { rows, subgraph }
askAgent(question, rows)          // -> { answer }
saveAnswer({ question, answer })  // -> { ok, id }
```

With `VITE_USE_MOCK=false` (default) these call the deployed Butterbase functions; with
`true` they use in-app mocks. The Butterbase side — schema, functions, RLS, deploy runbook —
lives in [`butterbase/`](butterbase/README.md). The agent backend is selected by
`VITE_AGENT_BACKEND` (`gateway` in Phase 1, `rocketride` in Phase 2).

## Layout

```
src/
  api/backend.js        seam: runGraphQuery / askAgent / saveAnswer (mock ⇄ Butterbase)
  api/butterbase.js     the Butterbase SDK client
  auth/useAuth.js       email/password auth state
  data/graph.js         the ~45-node synthetic company graph
  data/queryResults.js  rows + subgraph per hero question (mock mode)
  data/heroQueries.js   the three hero questions
  components/           QuestionChips · FreeTextBox · AnswerPane · GraphPane · LoginScreen
  App.jsx, main.jsx
butterbase/             Person C: schema.json · functions/*.ts · deploy runbook
```

## Team

- **A** — front-end (this) · **B** — Neo4j + RocketRide · **C** — Butterbase.
