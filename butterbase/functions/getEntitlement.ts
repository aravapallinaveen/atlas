// Atlas — getEntitlement  (Butterbase serverless function, Deno runtime)
//
// Returns the signed-in user's plan + how many queries they've used, so the UI can
// enforce the Free tier (5-query cap + partial graph) vs Pro (unlimited + full).
//   OUT: { plan: 'free' | 'pro', queriesUsed: number }
//
// Deploy: npx butterbase functions deploy butterbase/functions/getEntitlement.ts --name getEntitlement

export default async function handler(_req: Request, ctx: any): Promise<Response> {
  const userId = ctx.user?.id;
  if (!userId) return json({ error: "Not authenticated" }, 401);

  // Ensure a profile row exists (defaults to the Free plan).
  await ctx.db.query(
    `insert into profiles (user_id, email, plan) values ($1, $2, 'free')
     on conflict (user_id) do nothing`,
    [userId, ctx.user?.email ?? null],
  );

  const planRes = await ctx.db.query(`select plan from profiles where user_id = $1`, [userId]);
  const usedRes = await ctx.db.query(`select count from queries_used where user_id = $1`, [userId]);

  return json({
    plan: planRes.rows?.[0]?.plan ?? "free",
    queriesUsed: usedRes.rows?.[0]?.count ?? 0,
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
