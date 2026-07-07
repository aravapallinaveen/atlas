// Atlas — upgradeToPro  (Butterbase serverless function, Deno runtime)
//
// Completes the "Upgrade to Pro" checkout: validates the promo code (ENJOY0707,
// which makes the checkout $0) and flips the user's plan to 'pro'.
//   IN:  { promo: string }
//   OUT: { ok: true, plan: 'pro' }  |  { error }
//
// Deploy: npx butterbase functions deploy butterbase/functions/upgradeToPro.ts --name upgradeToPro

const PROMO_CODE = "ENJOY0707";

export default async function handler(req: Request, ctx: any): Promise<Response> {
  const userId = ctx.user?.id;
  if (!userId) return json({ error: "Not authenticated" }, 401);

  let promo = "";
  try {
    ({ promo } = await req.json());
  } catch {
    /* empty body is fine — treated as no promo */
  }

  if (String(promo ?? "").trim().toUpperCase() !== PROMO_CODE) {
    return json({ error: "Invalid or missing promo code." }, 400);
  }

  await ctx.db.query(
    `insert into profiles (user_id, email, plan) values ($1, $2, 'pro')
     on conflict (user_id) do update set plan = 'pro'`,
    [userId, ctx.user?.email ?? null],
  );

  return json({ ok: true, plan: "pro" });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
