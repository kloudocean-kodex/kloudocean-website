# KloudOcean Website

Static website for KloudOcean IT Services and Solutions Pvt Ltd.

Live site: https://thekloudocean.com
Repo: https://github.com/kloudocean-kodex/kloudocean-website
Netlify project: `astounding-cheesecake-e46f8d`

Master brand tagline: "Enterprise data oceans, governed on cloud platforms."
Secondary descriptor: "Cloud Migration | Data Governance | Multi-Cloud Strategy."

## Current State

- GitHub to Netlify CI/CD deploys from `main`.
- Primary domain is `thekloudocean.com`.
- `www.thekloudocean.com`, `kloudocean.co.in`, `www.kloudocean.co.in`, and the Netlify production subdomain redirect to the canonical domain.
- GA4 measurement ID `G-G5VW1T18RX` is installed with consent mode.
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
netlify.toml
```

## Implemented SEO And Conversion Work

- Clean URLs for main pages, blog posts, and service pages.
- `.html` URLs 301 redirect to clean URLs.
- Six dedicated service landing pages with `Service`, `FAQPage`, and breadcrumb structured data.
- Homepage `Organization` / `ProfessionalService` structured data.
- FAQ schema on the homepage.
- Branded custom 404 page.
- Sitemap with `lastmod` dates and 16 indexable URLs.
- Shared social preview image: `assets/og/cloud-data-migration-governance.jpg`.
- `og:image`, `twitter:image`, dimensions, and image alt text on indexable pages.
- Dedicated brand logo images for Organization schema, app/touch icons, and manifest usage.
- Split wordmark styling: "Kloud" uses cloud-white and "Ocean" uses ocean-cyan for the public site and social assets.
- Cookie consent banner and Google consent mode defaults.
- Security headers and CSP in `netlify.toml`.
- Static asset cache headers.
- Full footer and contact consistency across pages.
- Scroll reveal, reading progress bar, card hover polish, and founder/proof-point sections.

## Pending Trust Assets

- Replace founder initials with real approved headshots.
- Add real testimonials only after explicit client permission.
- Add partner badges only after verification. Do not claim Google Cloud Partner status unless KloudOcean is officially listed or approved.
- In GA UI, mark `qualify_lead`, `generate_lead`, and `contact` as key events after events appear.
- Continue content growth with more service-linked blog posts and real case-study proof.

## Operational Notes

- Contact email on the public site is `info@thekloudocean.com`.
- Netlify, Cloudflare, Search Console, and Analytics access should stay under the owner/admin account; do not put private login emails into public site copy.
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
netlify.cmd build --dry
git diff --check
```
