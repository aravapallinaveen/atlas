# Neo4j Setup Guide for Atlas

## Step 1: Create a Neo4j Aura Instance

1. Go to [neo4j.com/aura](https://neo4j.com/aura)
2. Sign up or log in to your account
3. Click **Create Database**:
   - **Instance name:** `atlas` (or your preference)
   - **Plan:** Free (free tier is sufficient for Phase 1)
   - **Region:** Choose the closest to you
4. Wait for the instance to spin up (~2-3 minutes)

## Step 2: Capture Connection Details

Once your instance is ready, Neo4j will show you:
- **Connection URI** — something like: `neo4j+s://xxxxxxxx.databases.neo4j.io`
- **Username** — usually: `neo4j`
- **Password** — auto-generated; save this securely

**Store these in your `.env` file (NEVER commit to git):**

```env
NEO4J_URI=neo4j+s://your-uri-here.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password-here
```

## Step 3: Seed the Database

1. In your Neo4j Aura instance, click **Open** to launch the **Aura Browser**
2. Paste the entire contents of [`neo4j-seed.cypher`](neo4j-seed.cypher) into the Query Editor
3. Click **Run** (or press Ctrl+Enter)
4. Wait for all queries to complete (~5-10 seconds)

**Expected output:** Each `CREATE` line should show `Created N relationships` or similar.

## Step 4: Verify the Seed

Run these three verification queries (one at a time) in Aura Browser:

```cypher
MATCH (n) RETURN count(n) as total_nodes;
```

**Expected:** `total_nodes = 45`

```cypher
MATCH ()-[r]->() RETURN count(r) as total_relationships;
```

**Expected:** `total_relationships ≈ 70+`

```cypher
MATCH (n:Person {name: 'Sam'}) RETURN n;
```

**Expected:** A node labeled `Sam` with type `Person`

## Step 5: Verify Hero Queries

Test each of the three hero queries (from [`hero-queries.cypher`](hero-queries.cypher)) to ensure they return correct results:

### HQ1 — Blast Radius
```cypher
MATCH (owner:Person {name: 'Sam'})-[:OWNS]->(service:Service {name: 'Billing'})
MATCH (downstream:Service)-[:DEPENDS_ON]->(service)
RETURN 
  owner.name as owner, 
  service.name as service, 
  downstream.name as impacts
ORDER BY downstream.name;
```

**Expected result:**
| owner | service | impacts |
|-------|---------|---------|
| Sam | Billing | Checkout |
| Sam | Billing | Notifications |

---

### HQ2 — Shortest Path
```cypher
MATCH path = shortestPath(
  (project:Project {name: 'Checkout Revamp'})-[*]-(team:Team {name: 'Data Platform'})
)
WITH path, nodes(path) as pathNodes, relationships(path) as pathRels
UNWIND pathNodes as node
WITH project, team, path, pathRels, collect(DISTINCT node) as uniqueNodes
UNWIND uniqueNodes as n
RETURN 
  project.name as start,
  n.name as step,
  team.name as end
ORDER BY n.name;
```

**Expected result:** A path connecting Checkout Revamp → Checkout → Pipeline → Priya → Data Platform

---

### HQ3 — Blocker Chain
```cypher
MATCH (root:Task {name: 'Migrate to new Gateway'})-[:BLOCKS*]->(blocked:Task {name: 'Ship Checkout Revamp'})
MATCH (assignee:Person)-[:ASSIGNED_TO]->(root)
WITH root, blocked, assignee
MATCH blockChain = (root)-[:BLOCKS*0..]->(blocked)
UNWIND nodes(blockChain) as blockNode
RETURN 
  root.name as root_cause,
  assignee.name as assigned_to,
  blockNode.name as task_in_chain,
  blocked.name as final_blocked_task
ORDER BY blockNode.name;
```

**Expected result:** Shows the blocker chain starting from "Migrate to new Gateway" (assigned to Sam) all the way to "Ship Checkout Revamp"

## Graph Schema Summary

### Node Types (45 total)
- **Teams** (4): Payments, Data Platform, Growth, Infrastructure
- **People** (11): Sam, Priya, Alex, Maya, Jordan, Chen, Nina, Omar, Lena, Raj, Tara
- **Services** (9): Billing, Checkout, Notifications, Pipeline, Auth, Gateway, Search, Ledger, Warehouse
- **Projects** (5): Checkout Revamp, Gateway Migration, Data Platform v2, Growth Experiments, Notifications v2
- **Tasks** (11): Various (see seed script)
- **Decisions** (5): Various (see seed script)

### Relationship Types
- `MEMBER_OF` — Person → Team
- `OWNS` — Person → Service
- `DEPENDS_ON` — Service → Service
- `TARGETS` — Project → Service
- `PART_OF` — Task → Project
- `BLOCKS` — Task → Task
- `ASSIGNED_TO` — Person → Task
- `AFFECTS` / `DRIVES` — Decision → Service/Task

## What's Next?

✅ **When ready, Person C (Butterbase) will:**
1. Extract these three Cypher queries into the `runGraphQuery()` function
2. Map `queryId` → Cypher query execution
3. Return `{rows, subgraph}` to the front-end
4. Wire up the `askAgent()` gateway endpoint

✅ **Person A (Front-end) will:**
1. Call `runGraphQuery(id)` on hero-chip clicks
2. Render the returned subgraph with `react-force-graph`
3. Highlight HQ2's shortest path

See [Phase 1](phase-1.md) for the full task breakdown.
