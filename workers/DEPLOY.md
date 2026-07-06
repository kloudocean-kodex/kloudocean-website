# Deploying the Turnstile Verification Handler

You have two options to deploy the server-side Turnstile validation handler: **Option A (Recommended)** which is a native Cloudflare Pages Function requiring zero extra configuration, or **Option B** which is a standalone Cloudflare Worker.

---

## Option A (Recommended): Native Cloudflare Pages Function

This project contains a native Pages Function in the `/functions` directory (`/functions/api/submit.js`). Cloudflare Pages compiles and deploys this function automatically whenever you push to your branch.

### Setup Instructions

1.  **Configure Environment Variables in Cloudflare Dashboard:**
    *   Go to your **Cloudflare Dashboard** -> **Workers & Pages** -> select your **Pages Project**.
    *   Navigate to **Settings** -> **Functions** -> **Environment variables**.
    *   Click **Add variables** under both **Production** and **Preview** sections, and enter:
        *   `TURNSTILE_SECRET` — your Cloudflare Turnstile secret key.
        *   `FORMSPREE_ENDPOINT` — your Formspree endpoint (e.g. `https://formspree.io/f/mqeoozan`).
    *   Click **Save**.
2.  **Trigger a Redeployment:**
    *   Deploying your latest code to Cloudflare Pages will automatically publish the endpoint at `https://your-site.com/api/submit`.
    *   No routing configuration or DNS setups are required; the `/api/submit` route resolves automatically.

---

## Option B: Standalone Cloudflare Worker

If you prefer to deploy the handler as a separate, standalone Cloudflare Worker, the code resides in `/workers/turnstile-worker`.

### Prerequisites
*   `wrangler` CLI installed (`npm install -g wrangler`) or use the Cloudflare Dashboard.

### Deployment Instructions

1.  Navigate to the worker directory:
    ```bash
    cd workers/turnstile-worker
    ```
2.  Publish the Worker:
    ```bash
    wrangler publish --name kloudocean-turnstile-worker
    ```
3.  Set the required secrets in the production environment:
    ```bash
    wrangler secret put TURNSTILE_SECRET --env production
    # Paste your Turnstile secret key when prompted

    wrangler secret put FORMSPREE_ENDPOINT --env production
    # Paste your Formspree endpoint URL when prompted
    ```
4.  **Important — Configure Route Mapping:**
    *   Since this is a standalone worker, you must map the `/api/submit` path on your Pages custom domain to route directly to this worker.
    *   In the Cloudflare Dashboard, go to your **Pages Project** -> **Settings** -> **Functions** -> **Service bindings** (or Worker Routes) and map the route `thekloudocean.com/api/submit` -> `kloudocean-turnstile-worker`.

---

## Testing the Handler

You can test either deployment by submitting form data directly using curl:

### 1. Test Fallback Submission (Blocked Captcha widget)
```bash
curl -X POST https://your-site.com/api/submit \
  -d "email=test@example.com&resource=ebook&fallback_captcha=1"
```
*   **Expectation:** Worker/Function bypasses turnstile verify, maps `x_fallback_marker=1`, submits to Formspree, and redirects the request correctly.

### 2. Test Verified Token Submission
```bash
curl -X POST https://your-site.com/api/submit \
  -d "email=test@example.com&cf-turnstile-response=<REAL_TOKEN>&resource=ebook"
```
*   **Expectation:** Worker/Function verifies token against Cloudflare, maps `x_turnstile_verified=1`, forwards to Formspree, and redirects the request correctly.