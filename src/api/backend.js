// ─────────────────────────────────────────────────────────────────────────────
// Atlas backend seam.
//
// The front-end depends ONLY on runGraphQuery / askAgent / saveAnswer. Each either
// calls the deployed Butterbase function (VITE_USE_MOCK=false, the default) or the
// in-app mock (VITE_USE_MOCK=true, for offline dev with no account).
//
//   runGraphQuery(queryId)            -> { rows, subgraph }
//   askAgent(question, rows)          -> { answer }
//   saveAnswer({ question, answer })  -> { ok, id }
//
// Butterbase side (Person C): butterbase/functions/*.ts + butterbase/schema.json.
// ─────────────────────────────────────────────────────────────────────────────

import { butterbase } from './butterbase'
import { QUERY_RESULTS } from '../data/queryResults'
import { HERO_BY_ID } from '../data/heroQueries'
import { getNode } from '../data/graph'

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'false') === 'true'
export const AGENT_BACKEND = import.meta.env.VITE_AGENT_BACKEND ?? 'gateway'

// ── Real backend (Butterbase serverless functions) ──────────────────────────
async function invoke(fnName, body) {
  const { data, error } = await butterbase.functions.invoke(fnName, { method: 'POST', body })
  if (error) throw new Error(error.message ?? `${fnName} failed`)
  if (data && data.error) throw new Error(data.error)
  return data
}

export async function runGraphQuery(queryId) {
  if (USE_MOCK) return mockRunGraphQuery(queryId)
  return invoke('runGraphQuery', { queryId }) // -> { rows, subgraph }
}

export async function askAgent(question, rows) {
  if (USE_MOCK) return mockAskAgent(question, rows)
  return invoke('askAgent', { question, rows }) // -> { answer }
}

export async function saveAnswer(payload) {
  if (USE_MOCK) return mockSaveAnswer(payload)
  return invoke('saveAnswer', payload) // -> { ok, id }
}

// ── Mock backend (VITE_USE_MOCK=true) ───────────────────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockRunGraphQuery(queryId) {
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

async function mockAskAgent(question, _rows) {
  await delay(650)
  const hero = Object.values(HERO_BY_ID).find((h) => h.question === question)
  return { answer: (hero && MOCK_ANSWERS[hero.id]) || 'I could not find a matching answer for that question.' }
}

async function mockSaveAnswer(payload) {
  await delay(300)
  // eslint-disable-next-line no-console
  console.log('[mock saveAnswer]', payload)
  return { ok: true, id: 'mock' }
}

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
