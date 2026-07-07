// The ~45-node synthetic company graph.
//
// This mirrors the graph Person B seeds into Neo4j Aura. The front-end keeps its
// own copy so it can (a) render a sample subgraph before any question is asked and
// (b) support a "full graph" view later (Phase 2 Pro tier). At runtime the real
// subgraphs come back from runGraphQuery() — this file is the display-metadata
// source of truth (labels, types, colors).

export const NODE_TYPE_META = {
  team: { label: 'Team', color: '#a78bfa' },
  person: { label: 'Person', color: '#38bdf8' },
  service: { label: 'Service', color: '#34d399' },
  project: { label: 'Project', color: '#fbbf24' },
  task: { label: 'Task', color: '#fb7185' },
  decision: { label: 'Decision', color: '#f472b6' },
}

export const NODES = [
  // Teams (4)
  { id: 't_payments', label: 'Payments', type: 'team' },
  { id: 't_dataplatform', label: 'Data Platform', type: 'team' },
  { id: 't_growth', label: 'Growth', type: 'team' },
  { id: 't_infra', label: 'Infrastructure', type: 'team' },

  // People (11)
  { id: 'p_sam', label: 'Sam', type: 'person' },
  { id: 'p_priya', label: 'Priya', type: 'person' },
  { id: 'p_alex', label: 'Alex', type: 'person' },
  { id: 'p_maya', label: 'Maya', type: 'person' },
  { id: 'p_jordan', label: 'Jordan', type: 'person' },
  { id: 'p_chen', label: 'Chen', type: 'person' },
  { id: 'p_nina', label: 'Nina', type: 'person' },
  { id: 'p_omar', label: 'Omar', type: 'person' },
  { id: 'p_lena', label: 'Lena', type: 'person' },
  { id: 'p_raj', label: 'Raj', type: 'person' },
  { id: 'p_tara', label: 'Tara', type: 'person' },

  // Services (9)
  { id: 's_billing', label: 'Billing', type: 'service' },
  { id: 's_checkout', label: 'Checkout', type: 'service' },
  { id: 's_notifications', label: 'Notifications', type: 'service' },
  { id: 's_pipeline', label: 'Pipeline', type: 'service' },
  { id: 's_auth', label: 'Auth', type: 'service' },
  { id: 's_gateway', label: 'Gateway', type: 'service' },
  { id: 's_search', label: 'Search', type: 'service' },
  { id: 's_ledger', label: 'Ledger', type: 'service' },
  { id: 's_warehouse', label: 'Warehouse', type: 'service' },

  // Projects (5)
  { id: 'pr_checkout_revamp', label: 'Checkout Revamp', type: 'project' },
  { id: 'pr_gateway_migration', label: 'Gateway Migration', type: 'project' },
  { id: 'pr_dataplatform_v2', label: 'Data Platform v2', type: 'project' },
  { id: 'pr_growth_experiments', label: 'Growth Experiments', type: 'project' },
  { id: 'pr_notifications_v2', label: 'Notifications v2', type: 'project' },

  // Tasks (11)
  { id: 'task_migrate_gateway', label: 'Migrate to new Gateway', type: 'task' },
  { id: 'task_checkout_integration', label: 'Update Checkout integration', type: 'task' },
  { id: 'task_billing_refactor', label: 'Refactor Billing calls', type: 'task' },
  { id: 'task_ship_checkout_revamp', label: 'Ship Checkout Revamp', type: 'task' },
  { id: 'task_pipeline_upgrade', label: 'Upgrade Pipeline', type: 'task' },
  { id: 'task_warehouse_migrate', label: 'Migrate Warehouse', type: 'task' },
  { id: 'task_auth_rotate', label: 'Rotate Auth keys', type: 'task' },
  { id: 'task_notif_templates', label: 'Rebuild Notification templates', type: 'task' },
  { id: 'task_search_index', label: 'Reindex Search', type: 'task' },
  { id: 'task_ledger_sunset', label: 'Sunset legacy Ledger', type: 'task' },
  { id: 'task_dashboard', label: 'Build metrics dashboard', type: 'task' },

  // Decisions (5)
  { id: 'dec_adopt_gateway', label: 'Adopt new Gateway', type: 'decision' },
  { id: 'dec_sunset_ledger', label: 'Sunset legacy Ledger', type: 'decision' },
  { id: 'dec_pipeline_owner', label: 'Pipeline → Data Platform', type: 'decision' },
  { id: 'dec_notif_split', label: 'Split Notifications', type: 'decision' },
  { id: 'dec_search_vendor', label: 'Pick Search vendor', type: 'decision' },
]

// Full edge list. [source, target, type]. Direction follows the natural reading of
// the relationship (e.g. Checkout DEPENDS_ON Billing).
const EDGE_TUPLES = [
  // MEMBER_OF (person -> team)
  ['p_sam', 't_payments', 'MEMBER_OF'],
  ['p_alex', 't_payments', 'MEMBER_OF'],
  ['p_raj', 't_payments', 'MEMBER_OF'],
  ['p_priya', 't_dataplatform', 'MEMBER_OF'],
  ['p_chen', 't_dataplatform', 'MEMBER_OF'],
  ['p_lena', 't_dataplatform', 'MEMBER_OF'],
  ['p_maya', 't_growth', 'MEMBER_OF'],
  ['p_nina', 't_growth', 'MEMBER_OF'],
  ['p_tara', 't_growth', 'MEMBER_OF'],
  ['p_jordan', 't_infra', 'MEMBER_OF'],
  ['p_omar', 't_infra', 'MEMBER_OF'],

  // OWNS (person -> service)
  ['p_sam', 's_billing', 'OWNS'],
  ['p_priya', 's_pipeline', 'OWNS'],
  ['p_alex', 's_checkout', 'OWNS'],
  ['p_jordan', 's_gateway', 'OWNS'],
  ['p_omar', 's_auth', 'OWNS'],
  ['p_chen', 's_warehouse', 'OWNS'],
  ['p_lena', 's_search', 'OWNS'],
  ['p_raj', 's_ledger', 'OWNS'],
  ['p_nina', 's_notifications', 'OWNS'],

  // DEPENDS_ON (service -> service)
  ['s_checkout', 's_billing', 'DEPENDS_ON'],
  ['s_notifications', 's_billing', 'DEPENDS_ON'],
  ['s_checkout', 's_pipeline', 'DEPENDS_ON'],
  ['s_checkout', 's_auth', 'DEPENDS_ON'],
  ['s_billing', 's_gateway', 'DEPENDS_ON'],
  ['s_billing', 's_ledger', 'DEPENDS_ON'],
  ['s_pipeline', 's_warehouse', 'DEPENDS_ON'],
  ['s_notifications', 's_auth', 'DEPENDS_ON'],
  ['s_search', 's_warehouse', 'DEPENDS_ON'],
  ['s_gateway', 's_auth', 'DEPENDS_ON'],

  // TARGETS (project -> service)
  ['pr_checkout_revamp', 's_checkout', 'TARGETS'],
  ['pr_gateway_migration', 's_gateway', 'TARGETS'],
  ['pr_dataplatform_v2', 's_pipeline', 'TARGETS'],
  ['pr_growth_experiments', 's_notifications', 'TARGETS'],
  ['pr_notifications_v2', 's_notifications', 'TARGETS'],

  // PART_OF (task -> project)
  ['task_migrate_gateway', 'pr_gateway_migration', 'PART_OF'],
  ['task_billing_refactor', 'pr_gateway_migration', 'PART_OF'],
  ['task_auth_rotate', 'pr_gateway_migration', 'PART_OF'],
  ['task_ledger_sunset', 'pr_gateway_migration', 'PART_OF'],
  ['task_checkout_integration', 'pr_checkout_revamp', 'PART_OF'],
  ['task_ship_checkout_revamp', 'pr_checkout_revamp', 'PART_OF'],
  ['task_pipeline_upgrade', 'pr_dataplatform_v2', 'PART_OF'],
  ['task_warehouse_migrate', 'pr_dataplatform_v2', 'PART_OF'],
  ['task_search_index', 'pr_dataplatform_v2', 'PART_OF'],
  ['task_dashboard', 'pr_dataplatform_v2', 'PART_OF'],
  ['task_notif_templates', 'pr_notifications_v2', 'PART_OF'],

  // BLOCKS (task -> task)
  ['task_migrate_gateway', 'task_billing_refactor', 'BLOCKS'],
  ['task_billing_refactor', 'task_checkout_integration', 'BLOCKS'],
  ['task_checkout_integration', 'task_ship_checkout_revamp', 'BLOCKS'],
  ['task_migrate_gateway', 'task_auth_rotate', 'BLOCKS'],
  ['task_warehouse_migrate', 'task_pipeline_upgrade', 'BLOCKS'],
  ['task_pipeline_upgrade', 'task_dashboard', 'BLOCKS'],

  // ASSIGNED_TO (person -> task)
  ['p_sam', 'task_migrate_gateway', 'ASSIGNED_TO'],
  ['p_sam', 'task_billing_refactor', 'ASSIGNED_TO'],
  ['p_alex', 'task_checkout_integration', 'ASSIGNED_TO'],
  ['p_alex', 'task_ship_checkout_revamp', 'ASSIGNED_TO'],
  ['p_jordan', 'task_auth_rotate', 'ASSIGNED_TO'],
  ['p_priya', 'task_pipeline_upgrade', 'ASSIGNED_TO'],
  ['p_chen', 'task_warehouse_migrate', 'ASSIGNED_TO'],
  ['p_lena', 'task_search_index', 'ASSIGNED_TO'],
  ['p_nina', 'task_notif_templates', 'ASSIGNED_TO'],
  ['p_raj', 'task_ledger_sunset', 'ASSIGNED_TO'],
  ['p_chen', 'task_dashboard', 'ASSIGNED_TO'],

  // DECIDES / AFFECTS (decision -> service|task)
  ['dec_adopt_gateway', 's_gateway', 'AFFECTS'],
  ['dec_adopt_gateway', 'task_migrate_gateway', 'DRIVES'],
  ['dec_sunset_ledger', 's_ledger', 'AFFECTS'],
  ['dec_pipeline_owner', 's_pipeline', 'AFFECTS'],
  ['dec_notif_split', 's_notifications', 'AFFECTS'],
  ['dec_search_vendor', 's_search', 'AFFECTS'],
]

export const LINKS = EDGE_TUPLES.map(([source, target, type]) => ({ source, target, type }))

const NODE_BY_ID = new Map(NODES.map((n) => [n.id, n]))

/** Look up a node's display metadata by id. Returns a plain object (never mutated). */
export function getNode(id) {
  const n = NODE_BY_ID.get(id)
  if (!n) throw new Error(`Unknown node id: ${id}`)
  return { ...n }
}

/**
 * A small, self-contained sample subgraph rendered on first load — proves the
 * react-force-graph rendering path works before any question is asked.
 */
export const SAMPLE_SUBGRAPH = {
  nodes: ['p_sam', 'p_alex', 'p_raj', 't_payments', 's_billing', 's_checkout', 's_ledger'].map(getNode),
  links: [
    { source: 'p_sam', target: 't_payments', type: 'MEMBER_OF' },
    { source: 'p_alex', target: 't_payments', type: 'MEMBER_OF' },
    { source: 'p_raj', target: 't_payments', type: 'MEMBER_OF' },
    { source: 'p_sam', target: 's_billing', type: 'OWNS' },
    { source: 'p_alex', target: 's_checkout', type: 'OWNS' },
    { source: 'p_raj', target: 's_ledger', type: 'OWNS' },
    { source: 's_checkout', target: 's_billing', type: 'DEPENDS_ON' },
    { source: 's_billing', target: 's_ledger', type: 'DEPENDS_ON' },
  ],
  highlightNodes: [],
  highlightLinks: [],
  sample: true,
}
