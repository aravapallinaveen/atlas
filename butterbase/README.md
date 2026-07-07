# Atlas — Butterbase backend (Person C)

Auth, database, and the three serverless functions the front-end depends on. This is
the "C" workstream of Phase 1; it plugs into the front-end seam
([`src/api/backend.js`](../src/api/backend.js)) with **no front-end changes**.

## Live app

| | |
|---|---|
| App ID | `app_rjtnsxkcal3z` |
| API URL | `https://api.butterbase.ai` |
| Region | `us-west-2` |
| Functions | `runGraphQuery`, `askAgent`, `saveAnswer` |
| Tables | `profiles`, `saved_questions`, `queries_used` (RLS on the last two) |

## The seam (front-end ↔ Butterbase)

| Front-end call | Butterbase function | Returns |
|---|---|---|
| `runGraphQuery(queryId)` | `functions/runGraphQuery.ts` | `{ rows, subgraph }` |
| `askAgent(question, rows)` | `functions/askAgent.ts` (AI gateway) | `{ answer }` |
| `saveAnswer({question, answer, queryId})` | `functions/saveAnswer.ts` | `{ ok, id }` |

The front-end SDK client is [`src/api/butterbase.js`](../src/api/butterbase.js); it reads
`VITE_APP_ID` / `VITE_API_URL` (see [`.env.example`](../.env.example)).

## Reproduce from scratch

Prereq: a Butterbase account. The CLI reads its key from `~/.butterbase/config.json`.

```bash
# 0. Auth (interactive: paste your bb_sk API key). Or write ~/.butterbase/config.json:
#    { "endpoint": "https://api.butterbase.ai", "apiKey": "bb_sk_..." }
npx butterbase login

# 1. App
npx butterbase apps create atlas
npx butterbase apps use <app-id>

# 2. Schema (declarative JSON — NOT raw SQL)
npx butterbase schema apply butterbase/schema.json --name atlas_init

# 3. Row-level security (per-user isolation)
npx butterbase rls enable saved_questions
npx butterbase rls create --table saved_questions --user-isolation --user-column user_id
npx butterbase rls enable queries_used
npx butterbase rls create --table queries_used --user-isolation --user-column user_id

# 4. Functions
npx butterbase functions deploy butterbase/functions/runGraphQuery.ts --name runGraphQuery
npx butterbase functions deploy butterbase/functions/saveAnswer.ts   --name saveAnswer
npx butterbase functions deploy butterbase/functions/askAgent.ts     --name askAgent \
  --timeout-ms 30000 --env AI_GATEWAY_KEY=<bb_sk...> --env ATLAS_MODEL=anthropic/claude-haiku-4.5

# 5. CORS — the CLI sends camelCase but the API wants snake_case, so use REST:
curl -X PATCH https://api.butterbase.ai/v1/<app-id>/config/cors \
  -H "Authorization: Bearer <bb_sk...>" -H "Content-Type: application/json" \
  -d '{"allowed_origins":["http://localhost:5273","https://atlas.butterbase.dev"],
       "allowed_methods":["GET","POST","OPTIONS"],
       "allowed_headers":["Content-Type","Authorization"],"allow_credentials":false}'

# 6. Front-end env
cp .env.example .env    # set VITE_APP_ID + VITE_API_URL, VITE_USE_MOCK=false
```

## Function env vars

| Var | Function | Purpose |
|---|---|---|
| `AI_GATEWAY_KEY` | askAgent | Bearer token for the AI gateway (the account `bb_sk`). The anon key is **not** authorized for the gateway. Server-side only. |
| `ATLAS_MODEL` | askAgent | Pinned to `anthropic/claude-haiku-4.5` for fast, consistent answers. |
| `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` | runGraphQuery | **Person B fills these** (same names as `NEO4J_SETUP.md`). Absent → the function serves known-good fixtures. Present → it runs the pre-written Cypher via Neo4j's HTTP Query API (derived from the Bolt URI's host). |

## Handoff to Person B (Neo4j)

`runGraphQuery.ts` ships with the pre-written hero Cypher (`CYPHER`) and known-good
fixtures. To go live on the seeded Aura graph:

1. `npx butterbase functions env set runGraphQuery NEO4J_URI=... NEO4J_USERNAME=... NEO4J_PASSWORD=...`
   (the same values from your `NEO4J_SETUP.md` / Aura instance)
2. Complete the result-shaping `TODO` in `runLiveNeo4j()` (Neo4j HTTP result → `{rows, subgraph}`).

Until then, the fixtures make the whole app demoable — no dependency on Neo4j.

## Notes / gotchas found while building

- **Password policy**: sign-up requires 8+ chars with upper, lower, number, **and a special char**.
- **AI gateway** occasionally spikes past the 30s function-timeout cap → `askAgent` aborts at 18s and returns a clean fallback answer so the demo never hangs.
- **Secret hygiene**: the `bb_sk` key lives only in `~/.butterbase/config.json` (gitignored)
  and as a server-side function env var — never in the front-end bundle. Rotate it after the event.
