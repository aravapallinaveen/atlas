// The three hero questions. Each maps to a queryId (hq1/hq2/hq3) that Person C's
// runGraphQuery() resolves to a pre-written Cypher query on the Neo4j graph.
export const HERO_QUESTIONS = [
  {
    id: 'hq1',
    tag: 'HQ1',
    chip: 'Blast radius of a Billing change',
    question: 'If Sam ships a change to Billing, what gets affected?',
  },
  {
    id: 'hq2',
    tag: 'HQ2',
    chip: 'Checkout Revamp → Data Platform',
    question: 'How is the Checkout Revamp connected to the Data Platform team?',
  },
  {
    id: 'hq3',
    tag: 'HQ3',
    chip: 'Why is the Checkout Revamp blocked?',
    question: 'Why is shipping the Checkout Revamp blocked, and who owns the root cause?',
  },
]

export const HERO_BY_ID = Object.fromEntries(HERO_QUESTIONS.map((h) => [h.id, h]))
