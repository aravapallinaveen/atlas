// Known-good results for each hero query — the shape Person C's runGraphQuery()
// must return: { rows, subgraph }. Here the subgraph is expressed as node ids
// (resolved to display metadata in backend.js) plus its own self-contained links
// and the highlight sets that drive the graph-pane visuals.
//
// highlightLinks entries are [sourceId, targetId] and MUST match the direction of
// the corresponding link in `links` (the graph pane keys highlights on
// `${source}->${target}`).

export const QUERY_RESULTS = {
  // HQ1 — blast radius / fan-out: Sam owns Billing; Checkout & Notifications depend on it.
  hq1: {
    rows: [
      { owner: 'Sam', service: 'Billing', impacts: 'Checkout' },
      { owner: 'Sam', service: 'Billing', impacts: 'Notifications' },
    ],
    nodeIds: ['p_sam', 's_billing', 's_checkout', 's_notifications'],
    links: [
      { source: 'p_sam', target: 's_billing', type: 'OWNS' },
      { source: 's_checkout', target: 's_billing', type: 'DEPENDS_ON' },
      { source: 's_notifications', target: 's_billing', type: 'DEPENDS_ON' },
    ],
    highlightNodes: ['s_billing', 's_checkout', 's_notifications'],
    highlightLinks: [
      ['s_checkout', 's_billing'],
      ['s_notifications', 's_billing'],
    ],
  },

  // HQ2 — shortestPath: Checkout Revamp -> Checkout -> Pipeline -> Priya -> Data Platform.
  // A few off-path nodes/links are included so the highlighted path visibly stands out.
  hq2: {
    rows: [
      { step: 1, node: 'Checkout Revamp', via: 'TARGETS' },
      { step: 2, node: 'Checkout', via: 'DEPENDS_ON' },
      { step: 3, node: 'Pipeline', via: 'OWNED_BY' },
      { step: 4, node: 'Priya', via: 'MEMBER_OF' },
      { step: 5, node: 'Data Platform', via: '—' },
    ],
    nodeIds: [
      'pr_checkout_revamp',
      's_checkout',
      's_pipeline',
      'p_priya',
      't_dataplatform',
      's_billing',
      's_warehouse',
      'p_chen',
      's_auth',
    ],
    links: [
      // the shortest path
      { source: 'pr_checkout_revamp', target: 's_checkout', type: 'TARGETS' },
      { source: 's_checkout', target: 's_pipeline', type: 'DEPENDS_ON' },
      { source: 'p_priya', target: 's_pipeline', type: 'OWNS' },
      { source: 'p_priya', target: 't_dataplatform', type: 'MEMBER_OF' },
      // off-path context
      { source: 's_checkout', target: 's_billing', type: 'DEPENDS_ON' },
      { source: 's_pipeline', target: 's_warehouse', type: 'DEPENDS_ON' },
      { source: 'p_chen', target: 't_dataplatform', type: 'MEMBER_OF' },
      { source: 's_checkout', target: 's_auth', type: 'DEPENDS_ON' },
    ],
    highlightNodes: ['pr_checkout_revamp', 's_checkout', 's_pipeline', 'p_priya', 't_dataplatform'],
    highlightLinks: [
      ['pr_checkout_revamp', 's_checkout'],
      ['s_checkout', 's_pipeline'],
      ['p_priya', 's_pipeline'],
      ['p_priya', 't_dataplatform'],
    ],
  },

  // HQ3 — blocker chain: Ship Checkout Revamp traces back to root "Migrate to new Gateway" (Sam).
  hq3: {
    rows: [
      { step: 1, task: 'Ship Checkout Revamp', status: 'blocked' },
      { step: 2, task: 'Update Checkout integration', blocks: 'Ship Checkout Revamp' },
      { step: 3, task: 'Refactor Billing calls', blocks: 'Update Checkout integration' },
      { step: 4, task: 'Migrate to new Gateway', blocks: 'Refactor Billing calls', root: true, owner: 'Sam' },
    ],
    nodeIds: [
      'task_ship_checkout_revamp',
      'task_checkout_integration',
      'task_billing_refactor',
      'task_migrate_gateway',
      'p_sam',
      'p_alex',
    ],
    links: [
      { source: 'task_migrate_gateway', target: 'task_billing_refactor', type: 'BLOCKS' },
      { source: 'task_billing_refactor', target: 'task_checkout_integration', type: 'BLOCKS' },
      { source: 'task_checkout_integration', target: 'task_ship_checkout_revamp', type: 'BLOCKS' },
      { source: 'p_sam', target: 'task_migrate_gateway', type: 'ASSIGNED_TO' },
      { source: 'p_alex', target: 'task_ship_checkout_revamp', type: 'ASSIGNED_TO' },
    ],
    highlightNodes: ['task_migrate_gateway', 'p_sam'],
    highlightLinks: [
      ['task_migrate_gateway', 'task_billing_refactor'],
      ['task_billing_refactor', 'task_checkout_integration'],
      ['task_checkout_integration', 'task_ship_checkout_revamp'],
      ['p_sam', 'task_migrate_gateway'],
    ],
  },
}
