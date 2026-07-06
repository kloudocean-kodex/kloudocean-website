Turnstile Worker: server-side verification + forwarder

Purpose

This Cloudflare Worker verifies Cloudflare Turnstile tokens server-side and forwards form submissions to a configured Formspree endpoint. It provides a resilient fallback path when the client-side Turnstile widget fails to load (the client still appends `fallback_captcha=1`).

Quick setup

1. Deploy the worker (recommended path: Cloudflare Workers via Wrangler or Pages Functions) and set the following environment variables / secrets:
   - `TURNSTILE_SECRET`: Your Cloudflare Turnstile secret key (site-specific)
   - `FORMSPREE_ENDPOINT`: Your Formspree form action URL (e.g. `https://formspree.io/f/xxxxxx`)

2. Route your site forms to the worker URL. Example form markup change:

<form action="/api/submit" method="POST" class="gate-form" data-resource="resource-name">
  <input type="hidden" name="resource" value="ebook">
  <input type="email" name="email" required>
  <!-- keep client-side Turnstile widget present for best UX -->
  <div class="cf-turnstile" data-sitekey="<YOUR_TURNSTILE_SITEKEY>"></div>
  <button type="submit">Get resource</button>
</form>

Replace `/api/submit` with the Worker route you register (for example `https://your-site.example.com/api/submit` or a Worker subpath).

Behavior

- If a Turnstile token is present and verification passes, the worker forwards the original form fields to `FORMSPREE_ENDPOINT` and adds:
  - `x_submitted_via=turnstile-worker`
  - `x_turnstile_verified=1`

- If Turnstile verification fails or the token is missing and the client attached `fallback_captcha=1`, the worker accepts the submission only if a valid-looking `email` field exists and tags it with `x_fallback_marker=1`. You should review these submissions manually or route them into a separate mailbox.

Security notes

- This worker does not implement advanced rate-limiting or IP-based throttling. For production, consider attaching a Cloudflare Firewall rule or using Workers KV / Durable Objects to rate-limit fallback submissions.
- Never hard-code `TURNSTILE_SECRET` in the repository. Use Cloudflare Secrets (wrangler secret put) or the dashboard to store the secret.

Debugging

- If the worker responds with `Formspree endpoint not configured` you need to set `FORMSPREE_ENDPOINT` in the worker bindings.
- Check Cloudflare Worker logs for `Turnstile verify error` or `Forward error` when network calls fail.

Deployment example (wrangler.toml excerpt)

[name]
# ...

[vars]
FORMSPREE_ENDPOINT = "https://formspree.io/f/yourformid"

[secrets]
TURNSTILE_SECRET = "<use wrangler secret put TURNSTILE_SECRET>"


