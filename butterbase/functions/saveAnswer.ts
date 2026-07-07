// Atlas — saveAnswer  (Butterbase serverless function, Deno runtime)
//
// Contract (matches src/api/backend.js):
//   IN:  { question: string, answer: string, queryId?: string }
//   OUT: { ok: true, id: string }
//
// Writes a row to saved_questions for the authenticated user (a visible DB write).
// user_id is taken from the verified JWT (ctx.user.id), never from the request body.
//
// Deploy:
//   npx butterbase functions deploy butterbase/functions/saveAnswer.ts --name saveAnswer

export default async function handler(req: Request, ctx: any): Promise<Response> {
  const userId = ctx.user?.id;
  if (!userId) return json({ error: "Not authenticated" }, 401);

  let question = "";
  let answer = "";
  let queryId: string | null = null;
  try {
    ({ question, answer, queryId = null } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!question || !answer) return json({ error: "Missing question or answer" }, 400);

  try {
    const result = await ctx.db.query(
      `insert into saved_questions (user_id, question, answer, query_id)
       values ($1, $2, $3, $4) returning id`,
      [userId, question, answer, queryId],
    );
    return json({ ok: true, id: result.rows?.[0]?.id });
  } catch (e) {
    return json({ error: "saveAnswer failed", detail: String(e) }, 500);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
