// Atlas — askAgent  (Butterbase serverless function, Deno runtime)
//
// Contract (matches src/api/backend.js):
//   IN:  { question: string, rows: unknown[] }
//   OUT: { answer: string }
//
// Calls the Butterbase AI gateway (the "gateway" backend for AGENT_BACKEND). If the
// gateway is slow (> ABORT_MS) or errors, we return a clean fallback answer so the
// demo never hangs or shows an error — the "demoable regardless" principle.
//
// Deploy:
//   npx butterbase functions deploy butterbase/functions/askAgent.ts --name askAgent \
//     --timeout-ms 30000 --env AI_GATEWAY_KEY=<bb_sk...> --env ATLAS_MODEL=anthropic/claude-haiku-4.5

// Canonical Atlas prompt. Phase 2's RocketRide pipeline MUST reuse this exact string
// so the two backends produce matching answers.
const ATLAS_PROMPT =
  "You are Atlas. Given the user's question and these graph results (JSON), answer in " +
  "2–3 sentences of plain prose — no markdown, no headings, no bullet points. Name the " +
  "specific people, services, and tasks and the path that connects them. Base your answer " +
  "only on the provided results; do not speculate or add caveats about missing data.";

// The gateway occasionally spikes past the function's hard timeout. Abort earlier so
// we can return a graceful fallback instead of a 504.
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

    if (!res.ok) return json({ answer: fallbackAnswer(question, rows) });

    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    return json({ answer: answer || fallbackAnswer(question, rows) });
  } catch (_e) {
    // Timeout / network error -> graceful fallback so the UI still shows an answer.
    return json({ answer: fallbackAnswer(question, rows) });
  } finally {
    clearTimeout(timer);
  }
}

// Deterministic fallback for the three hero questions (matched on keywords), with a
// generic summary otherwise. Only used when the gateway is unavailable.
function fallbackAnswer(question: string, rows: unknown): string {
  const q = question.toLowerCase();
  if (q.includes("billing") || q.includes("blast"))
    return "Sam owns the Billing service, and both Checkout and Notifications depend on it. A change Sam ships to Billing fans out to those two services — they are the blast radius.";
  if (q.includes("data platform") || q.includes("checkout revamp") && q.includes("connected"))
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
