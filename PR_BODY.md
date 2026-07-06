Title: chore: Turnstile worker + fallback handling, CSS utilities, inline-style refactor, 404 SEO

Summary

This PR introduces resilient form handling (client-side fallback + server-side Turnstile verification worker), replaces many inline styles with reusable CSS utilities, and improves 404 SEO metadata.

What changed

- Added Cloudflare Worker: `workers/turnstile-worker/worker.js` — verifies Cloudflare Turnstile tokens and forwards form submissions to Formspree, tagging submissions with `x_turnstile_verified` or `x_fallback_marker` when appropriate.
- Worker docs and example: `workers/turnstile-worker/README.md`, `workers/turnstile-worker/form-example.html`.
- Rewired site forms to post to the worker route `/api/submit` (in `index.html`, `resources.html`).
- Client fallback + accessibility: `script.js` now appends a hidden `fallback_captcha` field when Turnstile fails and shows an accessible `.fallback-note` to the user.
- CSS utilities: `styles.css` added small spacing / max-width utilities and replaced many inline `style=` occurrences across pages.
- 404 SEO: added canonical + OpenGraph/Twitter meta to `404.html`.
- README updated with worker deployment instructions.

Files changed

24 files changed — see commit 1d9edf7 on branch `website-fixes-2026-07`.

Why

Cloudflare Turnstile can fail to load in some corporate/firewalled environments; the combination of client-side fallback and server-side verification ensures leads are not lost while still enabling server-side token verification and labeling of fallback submissions for manual triage.

Testing / deployment checklist

1. Deploy Cloudflare Worker and set secrets/bindings:
   - `TURNSTILE_SECRET` (secret)
   - `FORMSPREE_ENDPOINT` (env/binding) = `https://formspree.io/f/mqeoozan`
2. Route worker to `/api/submit` (or update form `action` accordingly).
3. Verify:
   - Normal submissions (with Turnstile) forward and include `x_turnstile_verified=1`.
   - Fallback submissions (simulate blocked challenges.cloudflare.com) forward and include `x_fallback_marker=1` and require `email`.
4. Review fallback submissions and consider adding rate-limiting or a manual review workflow.

Notes for reviewers

- The worker uses `fetch` server-side to call Turnstile verify endpoint. Secrets are not in repo — use your Cloudflare secret management.
- I converted several high-impact inline `style=` usages to utility classes but left a few low-risk ones (tiny responsive tweaks) for a follow-up sweep.

Next steps

- Deploy worker and validate forms end-to-end.
- Complete inline `style=` sweep across remaining blog/service pages (I listed them in the audit). 
- Optionally add server-side rate-limiting for fallback submissions.

---

(Prepared by automation)