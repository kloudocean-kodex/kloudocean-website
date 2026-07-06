Deploying the Turnstile verification worker

Prerequisites
- `wrangler` installed (`npm install -g wrangler`) or use Cloudflare dashboard.
- Cloudflare account and the Pages site / Workers access.

Secrets needed (do NOT commit):
- `TURNSTILE_SECRET` — your Turnstile secret key (from Cloudflare) for server-side verification.
- `FORMSPREE_ENDPOINT` — e.g. `https://formspree.io/f/mqeoozan` (set as a binding/secret).

Quick deploy with wrangler (Pages + Worker routing)

1. From repo `workers/turnstile-worker` inspect `worker.js` and `wrangler.toml`.
2. Login and select account:

```bash
wrangler login
# or if using API token
wrangler config
```

3. Publish the Worker (example using wrangler publish)

```bash
cd workers/turnstile-worker
wrangler publish --name kloudocean-turnstile-worker
```

4. Set secrets (recommended via wrangler secret):

```bash
wrangler secret put TURNSTILE_SECRET --env production
# when prompted, paste the secret
wrangler secret put FORMSPREE_ENDPOINT --env production
# paste the endpoint URL
```

5. Route the worker to `/api/submit` depending on your Pages/Worker setup:
- For Cloudflare Pages Functions or Pages + Workers you can add a route or use a Pages `_routes` entry to map `/api/submit` to the worker.

Testing the endpoint

- Fallback submission (no Turnstile token) — requires `email` only:

```bash
curl -X POST https://your-site.example.com/api/submit \
  -d "email=test@example.com&resource=ebook&fallback_captcha=1"
```

- Token submission (use a real Turnstile token from the client):

```bash
curl -X POST https://your-site.example.com/api/submit \
  -d "email=test@example.com&cf-turnstile-response=<REAL_TOKEN>&resource=ebook"
```

Expectations
- Worker verifies token if provided and includes `x_turnstile_verified: 1` when valid.
- Fallback submissions are forwarded with `x_fallback_marker: 1`.

If you want I can add a `wrangler.toml` example or help craft the exact Pages route configuration; tell me whether you deploy via the Cloudflare dashboard or `wrangler`.