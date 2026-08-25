// Cloudflare Pages Function — handles POST /signup
// Stores each submitted email in the KV namespace bound as EMAILS.

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email } = await request.json();

    // basic server-side validation
    const ok = typeof email === "string" &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      return new Response(JSON.stringify({ error: "invalid email" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const clean = email.trim().toLowerCase();
    // key = the email itself, so duplicates overwrite instead of piling up
    await env.EMAILS.put("signup:" + clean, JSON.stringify({
      email: clean,
      at: new Date().toISOString()
    }));

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "server error" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
