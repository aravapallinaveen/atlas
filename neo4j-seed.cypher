// Atlas Neo4j Seed Script — COMPLETE & FIXED
// ~45-node synthetic company graph with all corrected relationships
// Copy-paste the ENTIRE script into Neo4j Aura Browser at once

// ============================================================================
// CLEAR DATABASE
// ============================================================================
MATCH (n) DETACH DELETE n;

// ============================================================================
// CREATE NODES: TEAMS (4)
// ============================================================================
CREATE (t_payments:Team {id: 't_payments', name: 'Payments'})
CREATE (t_dataplatform:Team {id: 't_dataplatform', name: 'Data Platform'})
CREATE (t_growth:Team {id: 't_growth', name: 'Growth'})
CREATE (t_infra:Team {id: 't_infra', name: 'Infrastructure'});

// ============================================================================
// CREATE NODES: PEOPLE (11)
// ============================================================================
CREATE (p_sam:Person {id: 'p_sam', name: 'Sam'})
CREATE (p_priya:Person {id: 'p_priya', name: 'Priya'})
CREATE (p_alex:Person {id: 'p_alex', name: 'Alex'})
CREATE (p_maya:Person {id: 'p_maya', name: 'Maya'})
CREATE (p_jordan:Person {id: 'p_jordan', name: 'Jordan'})
CREATE (p_chen:Person {id: 'p_chen', name: 'Chen'})
CREATE (p_nina:Person {id: 'p_nina', name: 'Nina'})
CREATE (p_omar:Person {id: 'p_omar', name: 'Omar'})
CREATE (p_lena:Person {id: 'p_lena', name: 'Lena'})
CREATE (p_raj:Person {id: 'p_raj', name: 'Raj'})
CREATE (p_tara:Person {id: 'p_tara', name: 'Tara'});

// ============================================================================
// CREATE NODES: SERVICES (9)
// ============================================================================
CREATE (s_billing:Service {id: 's_billing', name: 'Billing'})
CREATE (s_checkout:Service {id: 's_checkout', name: 'Checkout'})
CREATE (s_notifications:Service {id: 's_notifications', name: 'Notifications'})
CREATE (s_pipeline:Service {id: 's_pipeline', name: 'Pipeline'})
CREATE (s_auth:Service {id: 's_auth', name: 'Auth'})
CREATE (s_gateway:Service {id: 's_gateway', name: 'Gateway'})
CREATE (s_search:Service {id: 's_search', name: 'Search'})
CREATE (s_ledger:Service {id: 's_ledger', name: 'Ledger'})
CREATE (s_warehouse:Service {id: 's_warehouse', name: 'Warehouse'});

// ============================================================================
// CREATE NODES: PROJECTS (5)
// ============================================================================
CREATE (pr_checkout_revamp:Project {id: 'pr_checkout_revamp', name: 'Checkout Revamp'})
CREATE (pr_gateway_migration:Project {id: 'pr_gateway_migration', name: 'Gateway Migration'})
CREATE (pr_dataplatform_v2:Project {id: 'pr_dataplatform_v2', name: 'Data Platform v2'})
CREATE (pr_growth_experiments:Project {id: 'pr_growth_experiments', name: 'Growth Experiments'})
CREATE (pr_notifications_v2:Project {id: 'pr_notifications_v2', name: 'Notifications v2'});

// ============================================================================
// CREATE NODES: TASKS (11)
// ============================================================================
CREATE (task_migrate_gateway:Task {id: 'task_migrate_gateway', name: 'Migrate to new Gateway'})
CREATE (task_checkout_integration:Task {id: 'task_checkout_integration', name: 'Update Checkout integration'})
CREATE (task_billing_refactor:Task {id: 'task_billing_refactor', name: 'Refactor Billing calls'})
CREATE (task_ship_checkout_revamp:Task {id: 'task_ship_checkout_revamp', name: 'Ship Checkout Revamp'})
CREATE (task_pipeline_upgrade:Task {id: 'task_pipeline_upgrade', name: 'Upgrade Pipeline'})
CREATE (task_warehouse_migrate:Task {id: 'task_warehouse_migrate', name: 'Migrate Warehouse'})
CREATE (task_auth_rotate:Task {id: 'task_auth_rotate', name: 'Rotate Auth keys'})
CREATE (task_notif_templates:Task {id: 'task_notif_templates', name: 'Rebuild Notification templates'})
CREATE (task_search_index:Task {id: 'task_search_index', name: 'Reindex Search'})
CREATE (task_ledger_sunset:Task {id: 'task_ledger_sunset', name: 'Sunset legacy Ledger'})
CREATE (task_dashboard:Task {id: 'task_dashboard', name: 'Build metrics dashboard'});

// ============================================================================
// CREATE NODES: DECISIONS (5)
// ============================================================================
CREATE (dec_adopt_gateway:Decision {id: 'dec_adopt_gateway', name: 'Adopt new Gateway'})
CREATE (dec_sunset_ledger:Decision {id: 'dec_sunset_ledger', name: 'Sunset legacy Ledger'})
CREATE (dec_pipeline_owner:Decision {id: 'dec_pipeline_owner', name: 'Pipeline → Data Platform'})
CREATE (dec_notif_split:Decision {id: 'dec_notif_split', name: 'Split Notifications'})
CREATE (dec_search_vendor:Decision {id: 'dec_search_vendor', name: 'Pick Search vendor'});

// ============================================================================
// RELATIONSHIPS: MEMBER_OF (person -> team)
// ============================================================================
MATCH (p:Person {id: 'p_sam'}), (t:Team {id: 't_payments'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_alex'}), (t:Team {id: 't_payments'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_raj'}), (t:Team {id: 't_payments'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_priya'}), (t:Team {id: 't_dataplatform'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_chen'}), (t:Team {id: 't_dataplatform'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_lena'}), (t:Team {id: 't_dataplatform'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_maya'}), (t:Team {id: 't_growth'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_nina'}), (t:Team {id: 't_growth'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_tara'}), (t:Team {id: 't_growth'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_jordan'}), (t:Team {id: 't_infra'}) CREATE (p)-[:MEMBER_OF]->(t);
MATCH (p:Person {id: 'p_omar'}), (t:Team {id: 't_infra'}) CREATE (p)-[:MEMBER_OF]->(t);

// ============================================================================
// RELATIONSHIPS: OWNS (person -> service)
// ============================================================================
MATCH (p:Person {id: 'p_sam'}), (s:Service {id: 's_billing'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_priya'}), (s:Service {id: 's_pipeline'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_alex'}), (s:Service {id: 's_checkout'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_jordan'}), (s:Service {id: 's_gateway'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_omar'}), (s:Service {id: 's_auth'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_chen'}), (s:Service {id: 's_warehouse'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_lena'}), (s:Service {id: 's_search'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_raj'}), (s:Service {id: 's_ledger'}) CREATE (p)-[:OWNS]->(s);
MATCH (p:Person {id: 'p_nina'}), (s:Service {id: 's_notifications'}) CREATE (p)-[:OWNS]->(s);

// ============================================================================
// RELATIONSHIPS: DEPENDS_ON (service -> service)
// ============================================================================
MATCH (s1:Service {id: 's_checkout'}), (s2:Service {id: 's_billing'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_notifications'}), (s2:Service {id: 's_billing'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_checkout'}), (s2:Service {id: 's_pipeline'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_checkout'}), (s2:Service {id: 's_auth'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_billing'}), (s2:Service {id: 's_gateway'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_billing'}), (s2:Service {id: 's_ledger'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_pipeline'}), (s2:Service {id: 's_warehouse'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_notifications'}), (s2:Service {id: 's_auth'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_search'}), (s2:Service {id: 's_warehouse'}) CREATE (s1)-[:DEPENDS_ON]->(s2);
MATCH (s1:Service {id: 's_gateway'}), (s2:Service {id: 's_auth'}) CREATE (s1)-[:DEPENDS_ON]->(s2);

// ============================================================================
// RELATIONSHIPS: TARGETS (project -> service)
// ============================================================================
MATCH (pr:Project {id: 'pr_checkout_revamp'}), (s:Service {id: 's_checkout'}) CREATE (pr)-[:TARGETS]->(s);
MATCH (pr:Project {id: 'pr_gateway_migration'}), (s:Service {id: 's_gateway'}) CREATE (pr)-[:TARGETS]->(s);
MATCH (pr:Project {id: 'pr_dataplatform_v2'}), (s:Service {id: 's_pipeline'}) CREATE (pr)-[:TARGETS]->(s);
MATCH (pr:Project {id: 'pr_growth_experiments'}), (s:Service {id: 's_notifications'}) CREATE (pr)-[:TARGETS]->(s);
MATCH (pr:Project {id: 'pr_notifications_v2'}), (s:Service {id: 's_notifications'}) CREATE (pr)-[:TARGETS]->(s);

// ============================================================================
// RELATIONSHIPS: PART_OF (task -> project)
// ============================================================================
MATCH (t:Task {id: 'task_migrate_gateway'}), (pr:Project {id: 'pr_gateway_migration'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_billing_refactor'}), (pr:Project {id: 'pr_gateway_migration'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_auth_rotate'}), (pr:Project {id: 'pr_gateway_migration'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_ledger_sunset'}), (pr:Project {id: 'pr_gateway_migration'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_checkout_integration'}), (pr:Project {id: 'pr_checkout_revamp'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_ship_checkout_revamp'}), (pr:Project {id: 'pr_checkout_revamp'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_pipeline_upgrade'}), (pr:Project {id: 'pr_dataplatform_v2'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_warehouse_migrate'}), (pr:Project {id: 'pr_dataplatform_v2'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_search_index'}), (pr:Project {id: 'pr_dataplatform_v2'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_dashboard'}), (pr:Project {id: 'pr_dataplatform_v2'}) CREATE (t)-[:PART_OF]->(pr);
MATCH (t:Task {id: 'task_notif_templates'}), (pr:Project {id: 'pr_notifications_v2'}) CREATE (t)-[:PART_OF]->(pr);

// ============================================================================
// RELATIONSHIPS: BLOCKS (task -> task)
// ============================================================================
MATCH (t1:Task {id: 'task_migrate_gateway'}), (t2:Task {id: 'task_billing_refactor'}) CREATE (t1)-[:BLOCKS]->(t2);
MATCH (t1:Task {id: 'task_billing_refactor'}), (t2:Task {id: 'task_checkout_integration'}) CREATE (t1)-[:BLOCKS]->(t2);
MATCH (t1:Task {id: 'task_checkout_integration'}), (t2:Task {id: 'task_ship_checkout_revamp'}) CREATE (t1)-[:BLOCKS]->(t2);
MATCH (t1:Task {id: 'task_migrate_gateway'}), (t2:Task {id: 'task_auth_rotate'}) CREATE (t1)-[:BLOCKS]->(t2);
MATCH (t1:Task {id: 'task_warehouse_migrate'}), (t2:Task {id: 'task_pipeline_upgrade'}) CREATE (t1)-[:BLOCKS]->(t2);
MATCH (t1:Task {id: 'task_pipeline_upgrade'}), (t2:Task {id: 'task_dashboard'}) CREATE (t1)-[:BLOCKS]->(t2);

// ============================================================================
// RELATIONSHIPS: ASSIGNED_TO (person -> task)
// ============================================================================
MATCH (p:Person {id: 'p_sam'}), (t:Task {id: 'task_migrate_gateway'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_sam'}), (t:Task {id: 'task_billing_refactor'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_alex'}), (t:Task {id: 'task_checkout_integration'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_alex'}), (t:Task {id: 'task_ship_checkout_revamp'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_jordan'}), (t:Task {id: 'task_auth_rotate'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_priya'}), (t:Task {id: 'task_pipeline_upgrade'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_chen'}), (t:Task {id: 'task_warehouse_migrate'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_lena'}), (t:Task {id: 'task_search_index'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_nina'}), (t:Task {id: 'task_notif_templates'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_raj'}), (t:Task {id: 'task_ledger_sunset'}) CREATE (p)-[:ASSIGNED_TO]->(t);
MATCH (p:Person {id: 'p_chen'}), (t:Task {id: 'task_dashboard'}) CREATE (p)-[:ASSIGNED_TO]->(t);

// ============================================================================
// RELATIONSHIPS: AFFECTS & DRIVES (decision -> service/task)
// ============================================================================
MATCH (d:Decision {id: 'dec_adopt_gateway'}), (s:Service {id: 's_gateway'}) CREATE (d)-[:AFFECTS]->(s);
MATCH (d:Decision {id: 'dec_adopt_gateway'}), (t:Task {id: 'task_migrate_gateway'}) CREATE (d)-[:DRIVES]->(t);
MATCH (d:Decision {id: 'dec_sunset_ledger'}), (s:Service {id: 's_ledger'}) CREATE (d)-[:AFFECTS]->(s);
MATCH (d:Decision {id: 'dec_pipeline_owner'}), (s:Service {id: 's_pipeline'}) CREATE (d)-[:AFFECTS]->(s);
MATCH (d:Decision {id: 'dec_notif_split'}), (s:Service {id: 's_notifications'}) CREATE (d)-[:AFFECTS]->(s);
MATCH (d:Decision {id: 'dec_search_vendor'}), (s:Service {id: 's_search'}) CREATE (d)-[:AFFECTS]->(s);

// ============================================================================
// VERIFICATION: Run these to confirm everything is set up correctly
// ============================================================================
MATCH (n) RETURN count(n) as total_nodes;
MATCH ()-[r]->() RETURN count(r) as total_relationships;

// Test HQ1
MATCH (owner:Person {name: 'Sam'})-[:OWNS]->(service:Service {name: 'Billing'})
MATCH (downstream:Service)-[:DEPENDS_ON]->(service)
RETURN owner.name as owner, service.name as service, downstream.name as impacts ORDER BY downstream.name;

// Test HQ2
MATCH path = shortestPath(
  (project:Project {name: 'Checkout Revamp'})-[*1..15]-(team:Team {name: 'Data Platform'})
)
WITH nodes(path) as pathNodes
UNWIND pathNodes as node
RETURN pathNodes[0].name as start, node.name as step, pathNodes[-1].name as end
ORDER BY node.name;

// Test HQ3
MATCH (root:Task {name: 'Migrate to new Gateway'})-[:BLOCKS*1..10]->(blocked:Task {name: 'Ship Checkout Revamp'})
MATCH (assignee:Person)-[:ASSIGNED_TO]->(root)
RETURN root.name as root_cause, assignee.name as assigned_to, blocked.name as final_blocked_task;
