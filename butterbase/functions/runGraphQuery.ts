// Atlas — runGraphQuery  (Butterbase serverless function, Deno runtime)
//
// Contract (matches the front-end seam in src/api/backend.js):
//   IN:  { queryId: 'hq1' | 'hq2' | 'hq3' }
//   OUT: { rows, subgraph: { nodes, links, highlightNodes, highlightLinks } }
//
// Phase 1 behaviour: returns known-good fixtures so the whole app is demoable on
// Butterbase TODAY, with zero dependence on Person B's Neo4j. When B provides the
// Aura connection (function env: NEO4J_HTTP_URL, NEO4J_USER, NEO4J_PASSWORD), the
// live branch runs the pre-written Cypher via Neo4j's HTTP Query API and shapes the
// result into the same {rows, subgraph} contract.
//
// Deploy:
//   npx butterbase functions deploy butterbase/functions/runGraphQuery.ts --name runGraphQuery
//
// Self-contained on purpose (functions deploy a single file — no local imports).

// ── Node display metadata (id -> label/type), mirrors src/data/graph.js ──────────
const NODE: Record<string, { label: string; type: string }> = {
  p_sam: { label: "Sam", type: "person" },
  p_priya: { label: "Priya", type: "person" },
  p_alex: { label: "Alex", type: "person" },
  p_chen: { label: "Chen", type: "person" },
  s_billing: { label: "Billing", type: "service" },
  s_checkout: { label: "Checkout", type: "service" },
  s_notifications: { label: "Notifications", type: "service" },
  s_pipeline: { label: "Pipeline", type: "service" },
  s_warehouse: { label: "Warehouse", type: "service" },
  s_auth: { label: "Auth", type: "service" },
  t_dataplatform: { label: "Data Platform", type: "team" },
  pr_checkout_revamp: { label: "Checkout Revamp", type: "project" },
  task_ship_checkout_revamp: { label: "Ship Checkout Revamp", type: "task" },
  task_checkout_integration: { label: "Update Checkout integration", type: "task" },
  task_billing_refactor: { label: "Refactor Billing calls", type: "task" },
  task_migrate_gateway: { label: "Migrate to new Gateway", type: "task" },
};
const n = (id: string) => ({ id, ...NODE[id] });

// ── Pre-written hero Cypher (canonical versions from Person B's hero-queries.cypher) ─
const CYPHER: Record<string, string> = {
  hq1: `MATCH (owner:Person {name: 'Sam'})-[:OWNS]->(service:Service {name: 'Billing'})
        MATCH (downstream:Service)-[:DEPENDS_ON]->(service)
        RETURN owner.name AS owner, service.name AS service, downstream.name AS impacts
        ORDER BY downstream.name`,
  hq2: `MATCH path = shortestPath(
          (project:Project {name: 'Checkout Revamp'})-[*1..15]-(team:Team {name: 'Data Platform'}))
        WITH nodes(path) AS pathNodes
        UNWIND pathNodes AS node
        RETURN pathNodes[0].name AS start, node.name AS step, pathNodes[-1].name AS end`,
  hq3: `MATCH (root:Task {name: 'Migrate to new Gateway'})-[:BLOCKS*1..10]->(blocked:Task {name: 'Ship Checkout Revamp'})
        MATCH (assignee:Person)-[:ASSIGNED_TO]->(root)
        RETURN root.name AS root_cause, assignee.name AS assigned_to, blocked.name AS final_blocked_task`,
};

// ── Known-good fixtures (the {rows, subgraph} each hero query resolves to) ────────
const FIXTURES: Record<string, unknown> = {
  hq1: {
    rows: [
      { owner: "Sam", service: "Billing", impacts: "Checkout" },
      { owner: "Sam", service: "Billing", impacts: "Notifications" },
    ],
    subgraph: {
      nodes: ["p_sam", "s_billing", "s_checkout", "s_notifications"].map(n),
      links: [
        { source: "p_sam", target: "s_billing", type: "OWNS" },
        { source: "s_checkout", target: "s_billing", type: "DEPENDS_ON" },
        { source: "s_notifications", target: "s_billing", type: "DEPENDS_ON" },
      ],
      highlightNodes: ["s_billing", "s_checkout", "s_notifications"],
      highlightLinks: [["s_checkout", "s_billing"], ["s_notifications", "s_billing"]],
    },
  },
  hq2: {
    rows: [
      { step: 1, node: "Checkout Revamp", via: "TARGETS" },
      { step: 2, node: "Checkout", via: "DEPENDS_ON" },
      { step: 3, node: "Pipeline", via: "OWNED_BY" },
      { step: 4, node: "Priya", via: "MEMBER_OF" },
      { step: 5, node: "Data Platform", via: "—" },
    ],
    subgraph: {
      nodes: ["pr_checkout_revamp", "s_checkout", "s_pipeline", "p_priya", "t_dataplatform", "s_billing", "s_warehouse", "p_chen", "s_auth"].map(n),
      links: [
        { source: "pr_checkout_revamp", target: "s_checkout", type: "TARGETS" },
        { source: "s_checkout", target: "s_pipeline", type: "DEPENDS_ON" },
        { source: "p_priya", target: "s_pipeline", type: "OWNS" },
        { source: "p_priya", target: "t_dataplatform", type: "MEMBER_OF" },
        { source: "s_checkout", target: "s_billing", type: "DEPENDS_ON" },
        { source: "s_pipeline", target: "s_warehouse", type: "DEPENDS_ON" },
        { source: "p_chen", target: "t_dataplatform", type: "MEMBER_OF" },
        { source: "s_checkout", target: "s_auth", type: "DEPENDS_ON" },
      ],
      highlightNodes: ["pr_checkout_revamp", "s_checkout", "s_pipeline", "p_priya", "t_dataplatform"],
      highlightLinks: [
        ["pr_checkout_revamp", "s_checkout"],
        ["s_checkout", "s_pipeline"],
        ["p_priya", "s_pipeline"],
        ["p_priya", "t_dataplatform"],
      ],
    },
  },
  hq3: {
    rows: [
      { step: 1, task: "Ship Checkout Revamp", status: "blocked" },
      { step: 2, task: "Update Checkout integration", blocks: "Ship Checkout Revamp" },
      { step: 3, task: "Refactor Billing calls", blocks: "Update Checkout integration" },
      { step: 4, task: "Migrate to new Gateway", blocks: "Refactor Billing calls", root: true, owner: "Sam" },
    ],
    subgraph: {
      nodes: ["task_ship_checkout_revamp", "task_checkout_integration", "task_billing_refactor", "task_migrate_gateway", "p_sam", "p_alex"].map(n),
      links: [
        { source: "task_migrate_gateway", target: "task_billing_refactor", type: "BLOCKS" },
        { source: "task_billing_refactor", target: "task_checkout_integration", type: "BLOCKS" },
        { source: "task_checkout_integration", target: "task_ship_checkout_revamp", type: "BLOCKS" },
        { source: "p_sam", target: "task_migrate_gateway", type: "ASSIGNED_TO" },
        { source: "p_alex", target: "task_ship_checkout_revamp", type: "ASSIGNED_TO" },
      ],
      highlightNodes: ["task_migrate_gateway", "p_sam"],
      highlightLinks: [
        ["task_migrate_gateway", "task_billing_refactor"],
        ["task_billing_refactor", "task_checkout_integration"],
        ["task_checkout_integration", "task_ship_checkout_revamp"],
        ["p_sam", "task_migrate_gateway"],
      ],
    },
  },
};

// ── Live Neo4j (HTTP Query API) — enabled once Person B sets the env vars ─────────
// Uses the same creds Person B documents in NEO4J_SETUP.md:
//   NEO4J_URI (neo4j+s://<dbid>.databases.neo4j.io), NEO4J_USERNAME, NEO4J_PASSWORD
// The Bolt URI's host also serves Aura's HTTP Query API, so we derive the https URL
// and use plain fetch (no Bolt driver needed in the Deno runtime).
function neo4jHttpUrl(ctx: any): string {
  const host = String(ctx.env.NEO4J_URI).replace(/^neo4j\+s:\/\//, "").replace(/^bolt:\/\//, "").replace(/\/$/, "");
  return `https://${host}/db/neo4j/query/v2`;
}

async function runLiveNeo4j(queryId: string, ctx: any) {
  const auth = "Basic " + btoa(`${ctx.env.NEO4J_USERNAME}:${ctx.env.NEO4J_PASSWORD}`);
  const res = await fetch(neo4jHttpUrl(ctx), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ statement: CYPHER[queryId] }),
  });
  if (!res.ok) throw new Error(`Neo4j query failed: ${res.status}`);
  const data = await res.json();
  // TODO(Person B/C): shape `data` (Neo4j HTTP Query API result) into { rows, subgraph }.
  // Until that shaping is done we keep the fixture subgraph so the graph still renders
  // with the live rows attached for inspection.
  return { ...(FIXTURES[queryId] as any), _neo4j: data };
}

async function bumpQueriesUsed(ctx: any) {
  const userId = ctx.user?.id;
  if (!userId) return; // service-key/test caller — nothing to count
  try {
    await ctx.db.query(
      `insert into queries_used (user_id, count) values ($1, 1)
       on conflict (user_id) do update set count = queries_used.count + 1, updated_at = now()`,
      [userId],
    );
  } catch (_e) {
    // never let counter bookkeeping break the answer
  }
}

export default async function handler(req: Request, ctx: any): Promise<Response> {
  let queryId = "";
  try {
    ({ queryId } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!FIXTURES[queryId]) return json({ error: `Unknown queryId: ${queryId}` }, 400);

  await bumpQueriesUsed(ctx);

  const neo4jReady = !!(ctx.env.NEO4J_URI && ctx.env.NEO4J_USERNAME && ctx.env.NEO4J_PASSWORD);
  try {
    const result = neo4jReady ? await runLiveNeo4j(queryId, ctx) : FIXTURES[queryId];
    return json(result);
  } catch (_e) {
    // Live Neo4j hiccup -> fall back to the fixture so the demo never breaks.
    return json(FIXTURES[queryId]);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
