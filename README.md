# Atlas

Ask your company graph in plain language. Atlas answers questions about how people,
teams, services, projects, tasks, and decisions connect — running a real graph query,
lighting up the matching subgraph, and explaining the answer.

Built on three load-bearing tools: **Neo4j** (the graph), **Butterbase** (auth, DB, the
`runGraphQuery` function + AI gateway), and **RocketRide** (the reasoning step, Phase 2).

## Status — Phase 1 (front-end / Person A)

The React front-end is complete and demoable on its own via a mock backend seam:

- Two-pane layout: answer/chat pane + `react-force-graph` visualization.
- Three hero-question chips (HQ1 / HQ2 / HQ3) → each maps to a `queryId`.
- An inert free-text box (open text-to-Cypher stays off for now).
- Chip click → `runGraphQuery(id)` → render the returned subgraph → `askAgent(question, rows)` → show the answer.
- HQ2's shortest path is highlighted (amber path + directional particles).
- A "Save answer" button (wired to the `saveAnswer` seam).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
```

## Backend seam (how Person C plugs in)

The front-end depends ONLY on three functions in [`src/api/backend.js`](src/api/backend.js):

```js
runGraphQuery(queryId)            // -> { rows, subgraph }
askAgent(question, rows)          // -> { answer }
saveAnswer({ question, answer })  // -> { ok }
```

They currently return mock data (`USE_MOCK = true`). To go live, set `USE_MOCK = false`
and fill in the Butterbase calls — **no signature changes**, so the front-end is untouched.
The agent backend is selected by `VITE_AGENT_BACKEND` (`gateway` in Phase 1, `rocketride`
in Phase 2); see [`.env.example`](.env.example).

## Layout

```
src/
  api/backend.js        seam: runGraphQuery / askAgent / saveAnswer
  data/graph.js         the ~45-node synthetic company graph
  data/queryResults.js  rows + subgraph per hero question
  data/heroQueries.js   the three hero questions
  components/           QuestionChips · FreeTextBox · AnswerPane · GraphPane
  App.jsx, main.jsx
```

## Team

- **A** — front-end (this) · **B** — Neo4j + RocketRide · **C** — Butterbase.
