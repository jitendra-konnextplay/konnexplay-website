# KonnexPlay website

Sports venue management and booking platform for venues in India. This repository holds the design build of konnexplay.com.

## Quick start

Serve the folder over HTTP and open `index.html`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A plain `file://` open will NOT work — the runtime fetches page files over HTTP. The router now reads the real URL path (`/platform`, not `#/platform`), which needs a host that falls back unmatched paths to `index.html` — `Caddyfile` does this for the Railpack/Caddy production deploy. A host with no server-side rewrite support (plain GitHub Pages, S3, nginx without config) will only serve the homepage correctly for deep links typed or refreshed directly; Netlify and Vercel can be configured with their own rewrite rule (`_redirects` / `vercel.json`) to the same effect.

### GitHub Pages

Push this folder to a repository, then Settings → Pages → Deploy from branch → `main` / `root`. The site is live at `https://<user>.github.io/<repo>/`. Without a rewrite rule, only the homepage resolves on a hard refresh or a direct link; in-app navigation still works.

## What is here

| Path | What it is |
| --- | --- |
| `index.html` | The site. One document with a path-based client router; open this. |
| `*.dc.html` | Individual pages, loaded by the router at runtime |
| `assets/` | Real venue photography, product screenshots, video |
| `film-*.html` | Five brand films, each self-contained |
| `arena-3d.html` | 3D model of a box cricket arena, exports OBJ / GLB |
| `KonnexPlay website.html` | The whole site as ONE offline file — email this to anyone |
| `sitemap.xml`, `robots.txt` | SEO |
| `handoff/` | Full design spec for rebuilding in a production framework |

## Routes

`/` `/platform` `/pricing` `/demo` `/faq` `/about` `/contact` `/resources` `/research` `/channel-manager` `/legal` `/india`

Templated: `/sport/<box-cricket|football-turf|pickleball|padel|badminton|tennis>` and `/city/<surat|vadodara|bharuch|valsad|bangalore>`

These are the router's internal tokens, not the SEO-friendly slugs `handoff/README.md` specs out for the production rebuild (e.g. `/book-a-demo`, `/sports-venue-software-surat`) — the canonical tags already point at those future slugs, which is why they look different from the address bar today.

## Before this goes to production

This is a **design build**, not the production site. Two things matter most:

1. **It renders client-side.** For the SEO and AI-search goals this site is built around, rebuild it in a server-rendered framework (Next.js, Astro, Nuxt) with real URLs instead of hash routes. `handoff/README.md` is a complete spec written for exactly that job.
2. **The legal pages are drafts.** Company details are filled in (see below), but have an advocate review the liability, indemnity and data-processing clauses before publishing.

Also open: Pro at ₹18,000/court/year is a proposal, not a signed-off price. And there are deliberately **no testimonials or customer counts** anywhere — nothing was fabricated. Real quotes are the highest-value addition left.

## Company details on the legal pages

All six previously-pending values are filled in:

| Field | Value |
| --- | --- |
| Company | Konnex Play Private Limited |
| CIN | U62011GJ2026PTC181411 |
| Registered office | 57-58, Shiva Park Society, Adajan, Surat 395009, Gujarat |
| Payment gateway | Razorpay |
| Settlement to venue | five working days (T+5), client-confirmed |
| Effective date | 1 September 2026 (backdated intentionally, client-confirmed) |
| GST | Not mentioned anywhere. The company is not registered; the site says nothing either way. |

⚠️ The policies are drafted but **not reviewed by an advocate**. Have one read the liability, indemnity and data-processing clauses before publishing.

## Facts the site states

- ₹12,000 per court per year, billed annually in advance
- No KonnexPlay commission on the venue's own bookings; payment gateway charges apply
- Setup and training worth ₹5,000, waived
- The 12-month term begins after a 14-day setup period
- GST is not mentioned anywhere on the site
- The channel manager is **in development**, not live

Player payments are collected through KonnexPlay's payment gateway and settled to the venue's own bank account in about five working days. The site must never claim money goes "directly to your bank, not ours" — that wording is inaccurate under a split-settlement arrangement.

© 2026 Konnex Play Private Limited, Surat, Gujarat.
