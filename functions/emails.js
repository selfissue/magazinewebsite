// Cloudflare Pages Function — handles GET /emails?key=YOUR_SECRET
// Returns all collected emails as CSV. Protected by a secret you set.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // require the secret so the list isn't public
  if (url.searchParams.get("key") !== env.ADMIN_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const list = await env.EMAILS.list({ prefix: "signup:" });
  const rows = ["email,submitted_at"];
  for (const k of list.keys) {
    const val = await env.EMAILS.get(k.name);
    if (val) {
      const { email, at } = JSON.parse(val);
      rows.push(`${email},${at}`);
    }
  }

  return new Response(rows.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="emails.csv"'
    }
  });
}
