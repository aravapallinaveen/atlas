// Atlas Hero Queries
// These three Cypher queries correspond to hq1, hq2, and hq3
// Person C (Butterbase) will wire these into runGraphQuery()

// ============================================================================
// HQ1 — Blast radius / fan-out
// Question: "If Sam ships a change to Billing, what gets affected?"
// Expected: Sam owns Billing; Checkout & Notifications depend on it
// ============================================================================
// ID: hq1
MATCH (owner:Person {name: 'Sam'})-[:OWNS]->(service:Service {name: 'Billing'})
MATCH (downstream:Service)-[:DEPENDS_ON]->(service)
RETURN 
  owner.name as owner, 
  service.name as service, 
  downstream.name as impacts
ORDER BY downstream.name;

// ============================================================================
// HQ2 — Shortest path
// Question: "How is the Checkout Revamp connected to the Data Platform team?"
// Expected: Checkout Revamp → Checkout → Pipeline → Priya → Data Platform
// ============================================================================
// ID: hq2
MATCH path = shortestPath(
  (project:Project {name: 'Checkout Revamp'})-[*1..15]-(team:Team {name: 'Data Platform'})
)
WITH nodes(path) as pathNodes
UNWIND pathNodes as node
RETURN 
  pathNodes[0].name as start,
  node.name as step,
  pathNodes[-1].name as end
ORDER BY node.name;

// ============================================================================
// HQ3 — Blocker chain
// Question: "Why is shipping the Checkout Revamp blocked, and who owns the root cause?"
// Expected: Ship Checkout Revamp traces back to root "Migrate to new Gateway" (Sam)
// ============================================================================
// ID: hq3
MATCH (root:Task {name: 'Migrate to new Gateway'})-[:BLOCKS*1..10]->(blocked:Task {name: 'Ship Checkout Revamp'})
MATCH (assignee:Person)-[:ASSIGNED_TO]->(root)
RETURN 
  root.name as root_cause,
  assignee.name as assigned_to,
  blocked.name as final_blocked_task;
