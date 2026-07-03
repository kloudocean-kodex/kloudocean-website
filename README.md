# KloudOcean Website

Company-first voice throughout — no personal name or bio anywhere on the site.
Rupali Rajput (Director) is the one named human face, matching the branding
decision to keep KloudOcean independent of any one individual.

## What changed in this pass

- **Icon system** — every service card, "why" reason, case study, and free
  tool now has a purpose-built inline SVG icon in the brand's stroke style
  (cyan line, brass accent). No external images, no icon font, nothing to
  load or break.
- **Hero route chart** relabeled from generic LEGACY/VALIDATE/TRANSFORM/CLOUD
  to specific TERADATA/HDFS → ASSESS → CONVERT → BIGQUERY — matches the
  OG image and LinkedIn banner for one consistent visual signature.
- **The KloudOcean Passage Method** — the five-stage process now has an
  actual name, referenced on the homepage and About page.
- **New `resources.html`** — interactive Migration Cost Estimator (pure
  JS, no backend) plus four downloadable lead magnets.
- **Four real downloadable files** in `/downloads/` — not placeholders:
  - `kloudocean-migration-readiness-checklist.pdf` — free, no email gate
  - `kloudocean-teradata-bigquery-sql-cheatsheet.pdf` — 25 patterns, email-gated
  - `kloudocean-teradata-inventory-query-pack.sql` — 13 real DBC queries, email-gated
  - `kloudocean-data-governance-template-pack.xlsx` — 4-sheet workbook, email-gated
- **Two new blog posts** (governance, readiness checklist) — blog now has 4.
- **Tech stack** regrouped into 6 labeled categories instead of one flat pill cloud.
- **`about.html`** fully rewritten — company voice, Rupali named as Director,
  a generic "delivery bench" card instead of a second named individual, the
  Passage Method explained, KODE-X mentioned.
- **`og-image.jpg`** and **`assets/social/linkedin-banner.jpg`** generated —
  both use the same route-chart visual signature. Upload the banner directly
  to the LinkedIn company page; the OG image is already wired into every
  page's meta tags.
- **Consistency fixes**: WhatsApp float button and full nav now present on
  *every* page (previously missing on blog.html, both blog posts, privacy,
  terms). Contact email standardized to `info@thekloudocean.com` everywhere
  (Privacy/Terms previously said `hello@thekloudocean.com`).

## Before you deploy — verify these

| Item | Status | Action needed |
|---|---|---|
| WhatsApp number (`919822529779`) | ✅ Already correct everywhere | None, unless the number changes |
| Formspree ID (`mqeoozan`) | ✅ Already wired, and now reused for the 4 new lead-magnet forms | See note below |
| Contact email | ✅ Standardized to `info@thekloudocean.com` | Confirm this inbox is actually monitored |
| LinkedIn footer link | Points to `linkedin.com/company/kloudocean` | Confirm the page is live, or it 404s |
| GA4 | Tracking hooks are ready in `script.js` (`data-track="..."` fires automatically) | Drop your `gtag.js` snippet in each page's `<head>` — no other code changes needed |

**On reusing one Formspree form for everything:** the 4 new resource-unlock
forms on `resources.html` all POST to the same `mqeoozan` endpoint as the
assessment and MIKO waitlist forms, distinguished by a hidden `resource`
field. This works immediately with zero setup. If you want cleaner
separation in your Formspree dashboard later, create dedicated forms per
resource and swap the `action` URLs — everything else stays the same.

**Blog post dates:** the two new posts are dated today in their schema
markup. If you're not publishing all four at once, stagger the actual
`datePublished` values in the `<script type="application/ld+json">` block
near the top of each post to match when you really post them — a steady
weekly cadence reads better to Google than four posts on one day.

**One judgment call, flagged directly:** `about.html` names Rupali Rajput as
Director with initials "RR" as a placeholder avatar. Confirm the spelling of
her full name is correct — it was inferred from the Calendly username
(`rajputrupali138`) and hasn't been explicitly confirmed elsewhere.

## Structure

```
index.html              Homepage — services, pricing, case studies, process, free tools teaser, FAQ
about.html               Company story, Passage Method, Rupali + delivery bench
resources.html            Cost Estimator + all 4 downloads
blog.html                 Blog index (4 posts)
blog/
  teradata-bigquery-migration-cost-guide.html
  bteq-to-bigquery-conversion-patterns.html
  data-governance-after-migration.html          (new)
  migration-readiness-checklist.html             (new)
privacy.html              Privacy Policy
terms.html                 Terms of Service
downloads/
  kloudocean-migration-readiness-checklist.pdf   (new, free)
  kloudocean-teradata-bigquery-sql-cheatsheet.pdf (new, gated)
  kloudocean-teradata-inventory-query-pack.sql    (new, gated)
  kloudocean-data-governance-template-pack.xlsx   (new, gated)
assets/social/
  linkedin-banner.jpg      (new — 1584×396, upload to LinkedIn company page)
og-image.jpg               (new — 1200×630, wired into meta tags already)
styles.css                 Shared design system + icon system + estimator styles
script.js                  Mobile nav, GA4 hooks, estimator logic — zero dependencies
favicon.svg
robots.txt
sitemap.xml                 Updated with all new pages
netlify.toml                 Clean URLs + security headers + downloads Content-Disposition
```

Adding a new page later: copy any existing page, keep the nav/footer/WhatsApp
float blocks as-is (they're identical across every page on purpose), edit
the content inside `<div class="prose">` or `<div class="post-body">`, and
add one entry to `sitemap.xml`.
