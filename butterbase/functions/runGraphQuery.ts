// Atlas — runGraphQuery  (Butterbase serverless function, Deno runtime)
//
// Contract (matches the front-end seam in src/api/backend.js):
//   IN:  { queryId: 'hq1' | 'hq2' | 'hq3' }
//   OUT: { rows, subgraph: { nodes, links, highlightNodes, highlightLinks } }
//
// When the NEO4J_* env vars are set, this runs Person B's seeded Aura graph live via
// the Neo4j Query API (plain fetch — no Bolt driver needed on Deno): a tabular query
// for `rows` and a graph query for `subgraph`. If the env is missing OR the live query
// errors, it falls back to known-good fixtures so the demo never breaks.
//
// Also bumps the per-user queries_used counter.
//
// Deploy:
//   npx butterbase functions deploy butterbase/functions/runGraphQuery.ts --name runGraphQuery \
//     --env NEO4J_URI=... --env NEO4J_USERNAME=... --env NEO4J_PASSWORD=... --env NEO4J_DATABASE=...

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

// ── Cypher (canonical, from Person B's hero-queries.cypher + graph-shaped variants) ─
// ROW_CYPHER: tabular scalars → the `rows` handed to askAgent.
const ROW_CYPHER: Record<string, string> = {
  hq1: `MATCH (owner:Person {name:'Sam'})-[:OWNS]->(service:Service {name:'Billing'})
        MATCH (downstream:Service)-[:DEPENDS_ON]->(service)
        RETURN owner.name AS owner, service.name AS service, downstream.name AS impacts
        ORDER BY downstream.name`,
  hq2: `MATCH path = shortestPath(
          (project:Project {name:'Checkout Revamp'})-[*1..15]-(team:Team {name:'Data Platform'}))
        WITH nodes(path) AS pathNodes
        UNWIND range(0, size(pathNodes)-1) AS i
        RETURN i+1 AS step, pathNodes[i].name AS node`,
  hq3: `MATCH (root:Task {name:'Migrate to new Gateway'})-[:BLOCKS*1..10]->(blocked:Task {name:'Ship Checkout Revamp'})
        MATCH (assignee:Person)-[:ASSIGNED_TO]->(root)
        RETURN root.name AS root_cause, assignee.name AS assigned_to, blocked.name AS final_blocked_task`,
};

// GRAPH_CYPHER: returns the nodes + relationships to render as { nodes, rels } lists.
const GRAPH_CYPHER: Record<string, string> = {
  hq1: `MATCH (owner:Person {name:'Sam'})-[o:OWNS]->(service:Service {name:'Billing'})
        MATCH (downstream:Service)-[dep:DEPENDS_ON]->(service)
        WITH owner, service, o, collect(DISTINCT downstream) AS downs, collect(DISTINCT dep) AS deps
        RETURN [owner, service] + downs AS nodes, [o] + deps AS rels`,
  hq2: `MATCH path = shortestPath(
          (project:Project {name:'Checkout Revamp'})-[*1..15]-(team:Team {name:'Data Platform'}))
        RETURN nodes(path) AS nodes, relationships(path) AS rels`,
  hq3: `MATCH (root:Task {name:'Migrate to new Gateway'}), (blocked:Task {name:'Ship Checkout Revamp'})
        MATCH p = shortestPath((root)-[:BLOCKS*1..10]->(blocked))
        OPTIONAL MATCH (assignee:Person)-[a:ASSIGNED_TO]->(root)
        WITH nodes(p) AS pn, relationships(p) AS pr, collect(DISTINCT assignee) AS assignees, collect(DISTINCT a) AS arels
        RETURN pn + assignees AS nodes, pr + arels AS rels`,
};

// ── Known-good fixtures (fallback + the highlight sets reused by the live path) ────
const FIXTURES: Record<string, any> = {
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
      { step: 1, node: "Checkout Revamp" },
      { step: 2, node: "Checkout" },
      { step: 3, node: "Pipeline" },
      { step: 4, node: "Priya" },
      { step: 5, node: "Data Platform" },
    ],
    subgraph: {
      nodes: ["pr_checkout_revamp", "s_checkout", "s_pipeline", "p_priya", "t_dataplatform"].map(n),
      links: [
        { source: "pr_checkout_revamp", target: "s_checkout", type: "TARGETS" },
        { source: "s_checkout", target: "s_pipeline", type: "DEPENDS_ON" },
        { source: "p_priya", target: "s_pipeline", type: "OWNS" },
        { source: "p_priya", target: "t_dataplatform", type: "MEMBER_OF" },
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
      { root_cause: "Migrate to new Gateway", assigned_to: "Sam", final_blocked_task: "Ship Checkout Revamp" },
    ],
    subgraph: {
      nodes: ["task_ship_checkout_revamp", "task_checkout_integration", "task_billing_refactor", "task_migrate_gateway", "p_sam"].map(n),
      links: [
        { source: "task_migrate_gateway", target: "task_billing_refactor", type: "BLOCKS" },
        { source: "task_billing_refactor", target: "task_checkout_integration", type: "BLOCKS" },
        { source: "task_checkout_integration", target: "task_ship_checkout_revamp", type: "BLOCKS" },
        { source: "p_sam", target: "task_migrate_gateway", type: "ASSIGNED_TO" },
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

// ── Live Neo4j via the Aura Query API (fetch, no Bolt driver) ─────────────────────
function neo4jUrl(ctx: any): string {
  const host = String(ctx.env.NEO4J_URI)
    .replace(/^neo4j\+s:\/\//, "").replace(/^neo4j:\/\//, "").replace(/^bolt:\/\//, "").replace(/\/$/, "");
  const db = ctx.env.NEO4J_DATABASE ?? "neo4j";
  return `https://${host}/db/${db}/query/v2`;
}

async function neo4jQuery(ctx: any, statement: string): Promise<{ fields: string[]; values: any[][] }> {
  const auth = "Basic " + btoa(`${ctx.env.NEO4J_USERNAME}:${ctx.env.NEO4J_PASSWORD}`);
  const res = await fetch(neo4jUrl(ctx), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: auth },
    body: JSON.stringify({ statement }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error("Neo4j: " + (json?.errors?.[0]?.message ?? `HTTP ${res.status}`));
  }
  return json.data;
}

function rowsFrom(data: { fields: string[]; values: any[][] }): any[] {
  return data.values.map((v) => Object.fromEntries(data.fields.map((f, i) => [f, v[i]])));
}

function shapeSubgraph(data: { fields: string[]; values: any[][] }, queryId: string) {
  const row = data.values[0] ?? [];
  const rawNodes = (row[data.fields.indexOf("nodes")] ?? []).filter(Boolean);
  const rawRels = (row[data.fields.indexOf("rels")] ?? []).filter(Boolean);

  const idOf = (el: any) => el?.properties?.id ?? el?.elementId;
  const idByElementId = new Map<string, string>(rawNodes.map((n: any) => [n.elementId, idOf(n)]));

  const seenNode = new Set<string>();
  const nodes = [] as any[];
  for (const nd of rawNodes) {
    const id = idOf(nd);
    if (!id || seenNode.has(id)) continue;
    seenNode.add(id);
    nodes.push({ id, label: nd.properties?.name ?? id, type: String(nd.labels?.[0] ?? "").toLowerCase() });
  }

  const seenLink = new Set<string>();
  const links = [] as any[];
  for (const r of rawRels) {
    const source = idByElementId.get(r.startNodeElementId) ?? r.startNodeElementId;
    const target = idByElementId.get(r.endNodeElementId) ?? r.endNodeElementId;
    const key = `${source}->${target}:${r.type}`;
    if (seenLink.has(key)) continue;
    seenLink.add(key);
    links.push({ source, target, type: r.type });
  }

  const fx = FIXTURES[queryId].subgraph;
  return { nodes, links, highlightNodes: fx.highlightNodes, highlightLinks: fx.highlightLinks };
}

async function runLiveNeo4j(queryId: string, ctx: any) {
  const [rowData, graphData] = await Promise.all([
    neo4jQuery(ctx, ROW_CYPHER[queryId]),
    neo4jQuery(ctx, GRAPH_CYPHER[queryId]),
  ]);
  return { rows: rowsFrom(rowData), subgraph: shapeSubgraph(graphData, queryId) };
}

async function bumpQueriesUsed(ctx: any) {
  const userId = ctx.user?.id;
  if (!userId) return;
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
  if (neo4jReady) {
    try {
      return json({ ...(await runLiveNeo4j(queryId, ctx)), _source: "neo4j" });
    } catch (e) {
      // Live Neo4j hiccup -> fall back to the fixture so the demo never breaks.
      return json({ ...FIXTURES[queryId], _source: "fixture-fallback", _error: String(e) });
    }
  }
  return json({ ...FIXTURES[queryId], _source: "fixture" });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
