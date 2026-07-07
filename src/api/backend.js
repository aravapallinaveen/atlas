// ─────────────────────────────────────────────────────────────────────────────
// Atlas backend seam.
//
// Person A (front-end) builds ONLY against these three exported functions. Person C
// (Butterbase) swaps the mock bodies for real Butterbase function calls WITHOUT
// changing any signature — that keeps the front-end contract stable across phases.
//
//   runGraphQuery(queryId)      -> { rows, subgraph }
//   askAgent(question, rows)    -> { answer }
//   saveAnswer({ question, answer }) -> { ok }
//
// The `askAgent` reasoning backend is selected by VITE_AGENT_BACKEND:
//   gateway    (Phase 1 default) -> Butterbase AI gateway
//   rocketride (Phase 2)         -> deployed RocketRide pipeline
// ─────────────────────────────────────────────────────────────────────────────

import { QUERY_RESULTS } from '../data/queryResults'
import { HERO_BY_ID } from '../data/heroQueries'
import { getNode } from '../data/graph'

// Person C: flip this to false once the Butterbase functions are live.
const USE_MOCK = true

export const AGENT_BACKEND = import.meta.env.VITE_AGENT_BACKEND ?? 'gateway'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Resolve a hero queryId to its pre-written Cypher result.
 * @returns {Promise<{ rows: object[], subgraph: { nodes, links, highlightNodes, highlightLinks } }>}
 */
export async function runGraphQuery(queryId) {
  if (USE_MOCK) {
    await delay(450)
    const res = QUERY_RESULTS[queryId]
    if (!res) throw new Error(`Unknown queryId: ${queryId}`)
    return {
      rows: res.rows,
      subgraph: {
        nodes: res.nodeIds.map(getNode),
        links: res.links.map((l) => ({ ...l })),
        highlightNodes: res.highlightNodes ?? [],
        highlightLinks: res.highlightLinks ?? [],
      },
    }
  }

  // TODO(Person C): call the Butterbase runGraphQuery(queryId) function, which runs
  // the pre-written Cypher via neo4j-driver server-side and returns { rows, subgraph }.
  throw new Error('Butterbase runGraphQuery is not wired yet (set USE_MOCK = false when ready).')
}

/**
 * Turn graph rows into a natural-language answer.
 * @returns {Promise<{ answer: string }>}
 */
export async function askAgent(question, rows) {
  if (USE_MOCK) {
    await delay(650)
    return { answer: mockAnswer(question, rows) }
  }

  // TODO(Person C / B):
  //   AGENT_BACKEND === 'gateway'    -> POST to the Butterbase AI gateway with the Atlas prompt
  //   AGENT_BACKEND === 'rocketride' -> POST { question, rows } to the RocketRide endpoint (Phase 2)
  // Both return { answer }. Keep the gateway path as the fallback.
  throw new Error(`askAgent backend "${AGENT_BACKEND}" is not wired yet (set USE_MOCK = false when ready).`)
}

/**
 * Persist an answer the user liked (a visible DB write).
 * @returns {Promise<{ ok: boolean }>}
 */
export async function saveAnswer(payload) {
  if (USE_MOCK) {
    await delay(300)
    // eslint-disable-next-line no-console
    console.log('[mock saveAnswer] would write to saved_questions:', payload)
    return { ok: true }
  }

  // TODO(Person C): write a row to the Butterbase `saved_questions` table.
  throw new Error('saveAnswer is not wired to Butterbase yet (set USE_MOCK = false when ready).')
}

// ── Mock reasoning ───────────────────────────────────────────────────────────
// Canned answers mirror what the gateway LLM produces for each hero question, so
// the front-end is fully demoable on its own. Matched on the exact question text
// (the same input the real LLM receives).
const MOCK_ANSWERS = {
  hq1:
    'Sam owns the Billing service, and both Checkout and Notifications depend on it. ' +
    'So a change Sam ships to Billing fans out to those two services — they are the blast radius.',
  hq2:
    'The Checkout Revamp targets the Checkout service, which depends on the Pipeline. ' +
    'Pipeline is owned by Priya, who sits on the Data Platform team — so the shortest path is ' +
    'Checkout Revamp → Checkout → Pipeline → Priya → Data Platform.',
  hq3:
    'Shipping the Checkout Revamp is blocked by a chain of tasks that all trace back to one root: ' +
    '“Migrate to new Gateway.” That root task is owned by Sam, so unblocking Sam’s migration is what clears the chain.',
}

function mockAnswer(question, _rows) {
  const hero = Object.values(HERO_BY_ID).find((h) => h.question === question)
  return (hero && MOCK_ANSWERS[hero.id]) || 'I could not find a matching answer for that question.'
}
