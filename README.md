# KloudOcean Website

Static website for KloudOcean IT Services and Solutions Pvt Ltd.

Live site: https://thekloudocean.com
Repo: https://github.com/kloudocean-kodex/kloudocean-website
Cloudflare Pages project: `kloudocean-website`

Master brand tagline: "Enterprise data oceans, governed on cloud platforms."
Secondary descriptor: "Cloud Migration | Data Governance | Multi-Cloud Strategy."

## Current State

- GitHub Actions (`.github/workflows/deploy-cloudflare-pages.yml`) deploys to Cloudflare Pages on every push to `main`, via `cloudflare/wrangler-action`.
- Primary domain is `thekloudocean.com`.
- `www.thekloudocean.com`, `kloudocean.co.in`, `www.kloudocean.co.in`, and the `*.pages.dev` preview subdomain should all redirect/canonicalize to the primary domain. The `*.pages.dev` subdomain is set to `noindex, nofollow` via `_headers` so it never competes with the canonical domain in search.
- Cloudflare Pages serves clean URLs natively (e.g. `/about` resolves `about.html`, `/about.html` 301s to `/about`) — no `_redirects` file is needed for this and none is present. A custom `404.html` at the repo root is picked up automatically by Pages.
- Security headers, CSP, and cache-control rules live in `_headers` (the only file Cloudflare Pages reads for this — `netlify.toml` has been removed, it was dead configuration left over from the Netlify era and Cloudflare Pages never read it).
- GA4 measurement ID `G-G5VW1T18RX` is installed with consent mode on every page except `404.html`.
- Lead tracking emits `qualify_lead`, `generate_lead`, and `contact` events in addition to detailed custom events.
- Search Console sitemap is submitted at `https://thekloudocean.com/sitemap.xml`.
- IndexNow key file is live at `/a0f8f0c4f3f7427ab33ffdfddfa28717.txt`.

## Site Structure

```text
index.html
about.html
resources.html
blog.html
privacy.html
terms.html
404.html

services/
  teradata-to-bigquery-migration.html
  hdfs-to-bigquery-migration.html
  data-governance-consulting.html
  bigquery-cost-optimization.html
  fractional-data-architect.html
  analytics-dashboard-modernization.html

blog/
  teradata-bigquery-migration-cost-guide.html
  bteq-to-bigquery-conversion-patterns.html
  data-governance-after-migration.html
  migration-readiness-checklist.html

downloads/
  kloudocean-migration-readiness-checklist.pdf
  kloudocean-teradata-bigquery-sql-cheatsheet.pdf
  kloudocean-teradata-inventory-query-pack.sql
  kloudocean-data-governance-template-pack.xlsx

assets/og/
  cloud-data-migration-governance.jpg

assets/brand/
  kloudocean-logo-180.png
  kloudocean-logo-192.png
  kloudocean-logo-512.png

assets/social/
  linkedin-banner.jpg
  linkedin-page-cover-4200x700.jpg

styles.css
script.js
favicon.svg
site.webmanifest
robots.txt
sitemap.xml
_headers

.github/workflows/
  deploy-cloudflare-pages.yml
```

## Implemented SEO And Conversion Work

- Clean URLs for main pages, blog posts, and service pages.
- `.html` URLs 301 redirect to clean URLs.
- Six dedicated service landing pages with `Service`, `FAQPage`, and breadcrumb structured data.
- Homepage `Organization` / `ProfessionalService` structured data.
- FAQ schema on the homepage.
- Branded custom 404 page.
- Sitemap with `lastmod` dates and 14 SEO URLs; legal pages remain accessible but are not promoted in the sitemap.
- Shared social preview image: `assets/og/cloud-data-migration-governance.jpg`.
- `og:image`, `twitter:image`, dimensions, and image alt text on indexable pages.
- Dedicated brand logo images for Organization schema, app/touch icons, and manifest usage.
- Split wordmark styling: "Kloud" uses cloud-white and "Ocean" uses ocean-cyan for the public site and social assets.
- Cookie consent banner and Google consent mode defaults.
- Security headers and CSP in `_headers`.
- Static asset cache headers.
- Full footer and contact consistency across pages.
- Scroll reveal, reading progress bar, card hover polish, and founder/proof-point sections.

## Pending Trust Assets

- ~~Replace founder initials with real approved headshots.~~ **Done.** Real photos live at `assets/people/roop-rajput.jpg` and `assets/people/pradeep-g.jpg`, wired into both `index.html` (`.founder-avatar`) and `about.html` (`.person-avatar`), plus the `Person` schema `image` field on `about.html`.
- Add real testimonials only after explicit client permission.
- Add partner badges only after verification. Do not claim Google Cloud Partner status unless KloudOcean is officially listed or approved.
- In GA UI, mark `qualify_lead`, `generate_lead`, and `contact` as key events after events appear.
- Continue content growth with more service-linked blog posts and real case-study proof.
- SixthVision Media case study was anonymized to "Under NDA" pending confirmation that written permission is actually on file. Re-add the name only once that's confirmed.

## Pending Technical Setup (needs your Cloudflare/Formspree dashboard access — can't be done from the repo alone)

- **Turnstile bot protection**: `cf-turnstile` widgets are live on all 6 forms sharing the `mqeoozan` Formspree endpoint (assessment form, MIKO waitlist, and all 4 resource-gate forms), using Site Key `0x4AAAAAADwFlBCNQZy9vtWV`. **Still needed:** paste the matching Secret Key into Formspree's dashboard (that form's Settings → CAPTCHA → Cloudflare Turnstile) — this has to be done in the Formspree account directly, it can't be done from the repo. Until that's done, the widgets render but nothing is actually being blocked yet.
- ~~**Branded Calendly slug**: still `calendly.com/rajputrupali138/30min` everywhere.~~ **Done.** All CTAs now point to `calendly.com/kloudocean/strategy_meeting`.

## Operational Notes

- Contact email on the public site is `info@thekloudocean.com`.
- Cloudflare, GitHub, Search Console, and Analytics access should stay under the owner/admin account; do not put private login emails into public site copy.
- Formspree endpoint `mqeoozan` is reused for assessment, MIKO waitlist, and resource forms. Hidden fields distinguish intent/resource.
- The LinkedIn footer link points to `https://www.linkedin.com/company/kloudocean`; verify the company page stays live.
- Use `favicon.svg` for browser tab favicon, `assets/brand/kloudocean-logo-512.png` for structured data, `assets/og/cloud-data-migration-governance.jpg` for social link previews, `assets/social/linkedin-page-cover-4200x700.jpg` for the LinkedIn company Page cover, and `assets/social/linkedin-banner.jpg` for profile-style banner contexts.
- Keep the master tagline consistent across public brand surfaces. Service pages can be specific, but brand banners and social previews should not narrow the company to only one migration path.

## Editing Notes

- Keep public URLs clean and update `sitemap.xml` for new indexable pages.
- Keep canonical URLs aligned with clean URLs.
- Keep real claims conservative: no fake clients, badges, certifications, testimonials, or partner status.
- Run before pushing:

```powershell
node --check script.js
git diff --check
```

- Deploys happen via GitHub Actions on push to `main` (see `.github/workflows/deploy-cloudflare-pages.yml`). Watch the Actions tab for the run status instead of a local dry-run — there is no local Cloudflare Pages build step to run.
