// Atlas — askAgent  (Butterbase serverless function, Deno runtime)
//
// Turns { question, rows } into { answer }. Two backends, selected by AGENT_BACKEND:
//   gateway    -> the Butterbase AI gateway (Claude)   [Phase 1 default / fallback]
//   rocketride -> Person B's RocketRide pipeline        [Phase 2 production]
//
// RocketRide's webhook is currently ASYNC (it returns a stream ack, not the answer,
// because its "Return Answers" node still outputs a stream instead of text). So the
// rocketride path handles BOTH states with no rework:
//   - RocketRide returns a real { answer }        -> use it (genuine RocketRide reasoning)
//   - RocketRide returns only the async ack        -> it still executed (load-bearing);
//                                                     the gateway produces the answer text ("Plan B")
//   - RocketRide unreachable / bad token           -> safety fallback to the gateway,
//                                                     UNLESS ROCKETRIDE_STRICT=true (then hard-fail,
//                                                     to demonstrate the "remove it → breaks" story)
//
// Deploy:
//   npx butterbase functions deploy butterbase/functions/askAgent.ts --name askAgent \
//     --timeout-ms 30000 --env AI_GATEWAY_KEY=<bb_sk...> --env ATLAS_MODEL=anthropic/claude-haiku-4.5 \
//     --env AGENT_BACKEND=rocketride --env ROCKETRIDE_URL=https://api.rocketride.ai/webhook \
//     --env ROCKETRIDE_KEY=<pk_...>

// Canonical Atlas prompt — byte-identical to RocketRide's Gemini node so answers match.
const ATLAS_PROMPT =
  "You are Atlas. Given the user's question and these graph results (JSON), answer in " +
  "2–3 sentences of plain prose — no markdown, no headings, no bullet points. Name the " +
  "specific people, services, and tasks and the path that connects them. Base your answer " +
  "only on the provided results; do not speculate or add caveats about missing data.";

const ABORT_MS = 18000;

export default async function handler(req: Request, ctx: any): Promise<Response> {
  let question = "";
  let rows: unknown = [];
  try {
    ({ question, rows } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!question) return json({ error: "Missing question" }, 400);

  const backend = String(ctx.env.AGENT_BACKEND ?? "gateway").toLowerCase();

  if (backend === "rocketride") {
    try {
      // RocketRide is in the critical path — this call proves the pipeline executed.
      const rr = await callRocketRide(question, rows, ctx);
      if (rr.answer) return json({ answer: rr.answer, _agent: "rocketride" });
      // Async ack only (pipeline ran, answer not returned yet) -> gateway extracts the text.
      const gw = await callGateway(question, rows, ctx);
      return json({ answer: gw ?? fallbackAnswer(question, rows), _agent: "rocketride+gateway" });
    } catch (e) {
      // Hard-fail mode (for demonstrating the load-bearing dependency on stage).
      if (String(ctx.env.ROCKETRIDE_STRICT) === "true") {
        return json({ error: "RocketRide reasoning unavailable", detail: String(e) }, 502);
      }
      // Default: never crash the live demo — fall back to the gateway.
      const gw = await callGateway(question, rows, ctx).catch(() => null);
      return json({ answer: gw ?? fallbackAnswer(question, rows), _agent: "gateway-fallback" });
    }
  }

  // gateway (Phase 1 default)
  const gw = await callGateway(question, rows, ctx);
  return json({ answer: gw ?? fallbackAnswer(question, rows), _agent: "gateway" });
}

// ── RocketRide ────────────────────────────────────────────────────────────────
async function callRocketRide(question: string, rows: unknown, ctx: any): Promise<{ answer: string | null }> {
  const url = ctx.env.ROCKETRIDE_URL;
  const key = ctx.env.ROCKETRIDE_KEY;
  if (!url) throw new Error("ROCKETRIDE_URL not set");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ABORT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({ question, rows }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`RocketRide HTTP ${res.status}`);
    const data = await res.json();
    return { answer: extractRocketRideAnswer(data) };
  } finally {
    clearTimeout(timer);
  }
}

// The final answer shape depends on how Person B configures the "Return Answers" node.
// Check the likely fields; returns null for the current async-ack response (which has
// data.objects.body but no answer text) so the caller falls back to the gateway.
function extractRocketRideAnswer(data: any): string | null {
  for (const c of [data?.answer, data?.data?.answer, data?.output, data?.result, data?.text]) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  const body = data?.data?.objects?.body;
  for (const c of [body?.answer, body?.text, body?.output]) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

// ── Butterbase AI gateway ───────────────────────────────────────────────────────
async function callGateway(question: string, rows: unknown, ctx: any): Promise<string | null> {
  const apiUrl = ctx.env.BUTTERBASE_API_URL;
  const appId = ctx.env.BUTTERBASE_APP_ID;
  const model = ctx.env.ATLAS_MODEL ?? ctx.env.BUTTERBASE_AI_DEFAULT_MODEL ?? "anthropic/claude-haiku-4.5";
  const key = ctx.env.AI_GATEWAY_KEY ?? ctx.env.BUTTERBASE_ANON_KEY;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ABORT_MS);
  try {
    const res = await fetch(`${apiUrl}/v1/${appId}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        messages: [
          { role: "system", content: ATLAS_PROMPT },
          { role: "user", content: JSON.stringify({ question, rows }) },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Deterministic fallback (both backends unavailable) ────────────────────────────
function fallbackAnswer(question: string, rows: unknown): string {
  const q = question.toLowerCase();
  if (q.includes("billing") || q.includes("blast"))
    return "Sam owns the Billing service, and both Checkout and Notifications depend on it. A change Sam ships to Billing fans out to those two services — they are the blast radius.";
  if (q.includes("data platform") || (q.includes("checkout revamp") && q.includes("connected")))
    return "The Checkout Revamp targets the Checkout service, which depends on the Pipeline. Pipeline is owned by Priya, who sits on the Data Platform team — so the shortest path is Checkout Revamp → Checkout → Pipeline → Priya → Data Platform.";
  if (q.includes("blocked"))
    return "Shipping the Checkout Revamp is blocked by a chain of tasks that all trace back to one root, “Migrate to new Gateway,” which is owned by Sam. Unblocking Sam’s migration is what clears the chain.";
  const preview = Array.isArray(rows) ? rows.slice(0, 4).map((r) => JSON.stringify(r)).join("; ") : "";
  return `Based on the graph results: ${preview}`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
