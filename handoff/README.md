# Handoff: KonnexPlay marketing website

## Overview

The public marketing website for **KonnexPlay** — a sports venue management and booking platform for venue owners in India (box cricket, football turf, pickleball, padel, badminton, tennis).

The single business goal of this site is **qualified demo bookings**. Every page funnels to `Book a demo`.

The core message, in the client's own words: *"Let players book their slots. You run your venue."* Venue owners lose hours a day answering "Is 8 PM free?" by phone and WhatsApp. KonnexPlay gives the venue its own booking website where players see live availability, book, pay and get confirmed automatically — the booking lands in the owner's calendar with no call, no message and no manual confirmation.

## About the design files

**The files in this bundle are design references created in HTML — prototypes showing intended look and behaviour, not production code to copy.**

They are built on an internal design-component runtime (`.dc.html` files with a template plus a logic class, mounted through `support.js`). That runtime is a prototyping tool and **must not be carried into production.** The task is to **recreate these designs in the target codebase's own environment** — Next.js, Astro, Nuxt, whatever is established — using its routing, component and styling conventions. If no codebase exists yet, pick the framework and implement there.

A strong recommendation for this particular site: because SEO and AI-search visibility are primary goals, use a framework that **server-renders or statically generates** every page. Do not ship a client-rendered SPA. The current prototype uses a hash router purely so the whole thing can be previewed as one file; production must use real paths (see Routing).

### Fidelity

**High fidelity.** Colours, type, spacing, copy and interaction states are final and intentional. Recreate them precisely. Every hex value, font size and piece of copy in this document is the intended value.

Two exceptions, both marked in the files:
- The legal pages carry real company details (CIN U62011GJ2026PTC181411, registered office 57-58 Shiva Park Society, Adajan, Surat 395009, Razorpay, T+5 settlement, effective 1 September 2026) but have **not** been reviewed by an advocate.
- The `konnex-*.jsx` films are built on a prototype animation engine. See *Animated films* for what to do with them.

---

## Design tokens

### Colour

| Token | Hex | Use |
| --- | --- | --- |
| Navy | `#0D1B3E` | Primary ink, dark section grounds, primary buttons |
| Deep navy | `#061428` | Darkest ground, text on teal buttons |
| Teal | `#0DC59A` | Primary CTA fill, accents, eyebrow labels on dark |
| Teal pressed | `#0AA983` | CTA hover |
| Dark teal | `#088064` | Accent text on light grounds (passes 4.5:1 on paper) |
| Paper | `#FAFAF9` | Default page ground |
| White | `#FFFFFF` | Card and alternate section ground |
| Mint | `#E8FBF5` | Used **once** per page maximum, for the money/commission section |
| Body ink | `#3D4457` | Body copy on light |
| Muted ink | `#5A6275` | Labels, captions on light |
| Hairline | `#DDE0E5` | All rules and borders on light |
| — | ~~`#8A93A3`~~ | **Removed.** Was 3.1:1 on white and 2.47:1 on `#E3E6EA` for "Open" / "Booked" slot labels — the very text that is the non-colour fallback for booking status. Use `#5A6275`. |
| — | ~~`#9AA3B2`~~ | **Removed.** Was used for "Open"/"Booked" status text on white — only 2.54:1. Use `#5A6275` (6.11:1). Never introduce a grey lighter than `#6B7484` for text under 24px. |
| Body ink on dark | `#C6D0E4` / `#E3E8F2` | Body copy on navy |
| Muted on dark | `#8E9AB5` / `#AEB9CE` | Captions on navy |
| Hairline on dark | `rgba(255,255,255,.22)` | Rules on navy |
| Alert red | `#B3261E` | Only for "sold twice" / conflict states in films |
| Warning amber | `#FFF1E3` bg / `#8A4A0F` ink / `#F0DCC4` border | Draft notice on the legal page |

Never introduce a colour outside this list. No gradients except the two functional scrims noted under Photography.

### Typography

Two families, loaded from Google Fonts:

```
Outfit — weights 600, 700, 800 — display only
Inter  — weights 400, 500, 600, 700 — body and UI
```

| Role | Family / weight | Size | Line height | Tracking |
| --- | --- | --- | --- | --- |
| Hero display | Outfit 800 | `clamp(44px, 6vw, 104px)` | 0.95 | −0.03em |
| Moment number | Outfit 800 | `clamp(72px, 11vw, 160px)` | 0.95 | −0.04em |
| Section headline | Outfit 800 | `clamp(30px, 3.2vw, 40px)` | 1.05 | −0.02em |
| Sub-headline | Outfit 700 | 20–26px | 1.15–1.25 | −0.02em |
| Body | Inter 400 | 17–18px | 1.65 | — |
| Small / caption | Inter 400–500 | 14–16px | 1.55 | — |
| Micro label | Inter 700 | 11–12px, **uppercase** | 1.2 | 0.14em |
| Numeric data | Inter 600–700 | varies | — | `font-variant-numeric: tabular-nums` |

**Headlines are sentence case.** Uppercase is reserved for the 11–12px micro labels. (An earlier revision set headlines in all caps; it read as shouting and was reverted. Do not reintroduce it.)

Body measure caps at **62 characters** (`max-width` in `ch`). Use `text-wrap: balance` on headlines and `text-wrap: pretty` on body.

### Spacing and layout

- Content max width **1200px**, gutters **24px**.
- Section padding: **96–160px** top and bottom on desktop, **64–88px** on mobile.
- Headline → body: **24px**. Body → next element: **56px**.
- Twelve-column thinking, but **asymmetric always**: `45fr 55fr`, `55fr 45fr`, `5fr 7fr`, `7fr 5fr`. **Never 6/6.**
- No section may end with an empty right half. If a section has no image, set the body in six columns and put a pull quote in the outer three.
- **No border radius anywhere** except: 52px on the film tap-ring (a circle), 2.5px on the nine logo squares, and 12px dots in mock browser chrome. Everything else is square. This is the site's strongest visual signature — keep it.
- **No card shadows** except `0 30px 60px rgba(13,27,62,.12)` on the product-tour frame and `0 40px 100px rgba(0,0,0,.45)` on the film's browser card.
- Layout with flex/grid + `gap`. Never inline-flow spacing.

### Motion

Restrained and purposeful. Buttons darken over **140–150ms**. Nothing fades in on scroll except the one reveal noted below. All motion respects `prefers-reduced-motion: reduce`, which must collapse animations to their end state rather than removing content.

---

## Routing

The prototype is one file (`KonnexPlay.dc.html`) with a hash router, purely for single-file preview. **Production needs real URLs.** Recommended map:

| Prototype route | Production path | Source file |
| --- | --- | --- |
| `#/home` | `/` | `Home.dc.html` |
| `#/platform` | `/platform` | `Platform.dc.html` |
| `#/pricing` | `/pricing` | `Pricing.dc.html` |
| `#/demo` | `/book-a-demo` | `Book a demo.dc.html` |
| `#/faq` | `/faq` | `FAQ.dc.html` |
| `#/about` | `/about` | `About.dc.html` |
| `#/contact` | `/contact` | `Contact.dc.html` |
| `#/resources` | `/resources` | `Blog.dc.html` |
| `#/blog` | `/blog` | `Blog Posts.dc.html` |
| `#/blog/<slug>` | `/blog/<slug>` | `Blog Posts.dc.html` (templated, posts from `blog-posts.json`) |
| `#/research` | `/research/surat-venue-report-2026` | `Research.dc.html` |
| `#/channel-manager` | `/channel-manager` | `Channel manager.dc.html` |
| `#/legal?a=privacy\|terms\|refunds` | `/privacy`, `/terms`, `/refunds` (three pages) | `Legal.dc.html` |
| `#/india` | `/sports-venue-management-software-india` | `India.dc.html` |
| `#/sport/<slug>` | `/<sport>-booking-software` | `Sport.dc.html` (templated) |
| `#/city/<slug>` | `/sports-venue-software-<city>` | `City.dc.html` (templated) |

Sport slugs: `box-cricket`, `football-turf`, `pickleball`, `padel`, `badminton`, `tennis`.
City slugs: `surat`, `vadodara`, `bharuch`, `valsad`, `bangalore`.

Split the single legal page into three routes in production — each policy needs its own canonical URL and title.

---

## Global chrome

### Header (`Nav.dc.html`)

`position: fixed`, full width, `z-index: 40`. On the home page it floats transparently over the hero video with white ink; on every other page it sits on paper with navy ink, and the page gets a **77px spacer** so content clears it.

Left: the logo — a 3×3 grid of 8px squares (2.5px radius, 2px gap) in teal and `#DDE0E5` in the pattern `▓░▓ / ▓▓░ / ▓░▓`, then the wordmark "Konnex" in navy + "Play" in teal, Outfit 700 / 22px / −0.02em.

Centre: nav links, Inter 500 / 15px — **Platform · How it works · Pricing · Resources** (four items; a longer list was trialled and cut).

Right: `Book a demo` — teal fill `#0DC59A`, ink `#061428`, Inter 600 / 15px, padding 12px 20px, square.

Below **1060px** the links collapse to a `Menu` / `Close` button that opens a full-width stack of 18px/600 links, each 18px 24px with hairline dividers.

### Mobile sticky CTA

Below **768px**, once the user scrolls past 700px, a fixed bottom bar appears: `rgba(250,250,249,.96)` ground, hairline top, containing a full-width teal `Book a demo` at 16px padding. **Suppressed on the demo page itself.**

### Footer (`Footer.dc.html`)

Navy ground. Closing statement "More bookings. / **Less answering.**" (second line teal) at `clamp(34px, 4.6vw, 64px)` beside a demo CTA, on a `7fr 5fr` split with a hairline below.

Grid is `1.5fr 1fr 1fr 1fr 1fr` above 1000px, `1fr 1fr` to 640px, then one column. First cell: logo, a short product paragraph, phone, email, hours and a demo CTA. Then four link columns:
- **Platform** — Platform, How it works, Tournaments and rate plans, What commission costs, Pricing, Channel manager *(in development)*, Book a demo
- **Sports** — the six sport pages
- **Cities** — India, Surat, Vadodara, Bharuch, Valsad, Bangalore *(these are the only inbound links to the India and city pages — do not drop this column)*
- **Company** — About, 2026 Surat venue report, Resources, FAQ, Contact, Instagram, Privacy policy, Terms of service, Cancellation and refunds, the four film links, `hello@konnexplay.com`, `+91 77788 58901`

Bottom row: `© 2026 Konnex Play Private Limited · Surat, Gujarat` with Privacy · Terms · Cancellation and refunds.

---

## Screens

### 1 · Home (`/`)

**Twelve sections** in this order. The narrative is the design; do not reorder. (Sections 02–12 carry `data-screen-label` values 02–11; the film row sits inside 05.)

**01 Hero** — full-bleed. `assets/video-1.mp4` autoplaying muted and looping, poster `assets/venue-turf-night-wide.jpg`, `min-height: 82vh`, with a navy scrim at 70% on the left third fading to 20% at the right so the headline sits on the dark side.
- Micro label with a pulsing 8px teal square: `SPORTS VENUE MANAGEMENT SOFTWARE · INDIA`
- H1: **"Let players book their slots. You run your venue."**
- Body: "Your venue gets its own booking website. Players see live slots, pick one, pay and get confirmed on their own. You get one calendar, the money in your own bank account, and your Saturday back."
- CTAs: `Book a 20-minute demo` (teal) and `See how it works` (1.5px navy outline)
- Three floating proof cards over the video: `PAID ONLINE ₹1,400`, `NEW BOOKING · 11:14 PM`, `COLLECTED TODAY ₹18,400 — 11 slots, none of them by phone`

**02 Terms strip** — one line: ₹12,000 per court per year · no commission on your own bookings · setup and training worth ₹5,000, waived. **No fabricated metrics.**

**03 Seven questions you will never answer again** — micro label `WHAT YOU STOP REPLYING TO`; intro "It is 9 PM on a Saturday, you are at the counter, and the phone has gone seven times with the same seven questions. Your booking website answers every one of them, at any hour, without you."

Then seven rows at the **full 1200px width**, two equal flexible columns (`minmax(0,1fr) minmax(0,1fr)`), hairline above each row, 18px vertical padding. Left: the quoted question, Outfit 700 / `clamp(19px,1.9vw,24px)`, `line-through` in teal at 2px. Right: a different sentence-case answer per row, Inter 17px `#3D4457`:

| Question | Answer |
| --- | --- |
| "Is 8 PM free?" | Your booking website already shows it booked |
| "How much is the turf?" | Your rates sit next to every slot |
| "Can I book tomorrow?" | Tomorrow's slots are live |
| "Is Sunday morning free?" | Sunday's open slots, court by court |
| "Which slot is available?" | Every open slot, every court |
| "Can I pay now?" | Paid online, in two taps |
| "Can you confirm my booking?" | Confirmation goes out on its own |

⚠️ Do **not** nest this list inside a narrow column and do **not** repeat one label down the right column — both were bugs that took several passes to fix. The list needs the full grid width or the answers wrap to two lines and a dead gap opens on the left.

Closing pull quote: "Seven questions, forty times a day, is not customer service. It is a form your players could fill in themselves."

**04 The register and the screen** (id `register`) — the signature section, and the site's one scroll-triggered reveal. A ruled paper register for Saturday 12/09 with **two groups promised 8 PM on Turf 1** (both marked `?`, annotated "double booked — 8 PM, Turf 1"), dissolving into the same Saturday in KonnexPlay where Hardik P. appears at 10 PM annotated "rebooked". Closing line: "One slot can only be sold once. The clash never reaches your Saturday."

⚠️ The two panels must stay internally consistent: same date, same seven time rows, and the rebooked entry last. Earlier drafts had mismatched dates and an unexplained missing booking.

**05 Films** — the 41-second story film embedded as `assets/film-story.mp4` with controls, plus a three-up row of poster cards linking to the tournament (25s), rates (20s) and channel (27s) films.

**06 Product tour** (id `platform`) — micro label `WHAT YOUR STAFF WILL ACTUALLY USE`, headline "Five screens run the whole venue." Five entries — your own booking website · live slots priced your way · money before the game · one calendar, every court · the report you open on the 1st — cross-fading a real screenshot per entry.

**07 The 11 PM booking** — "The bookings you lose are the ones that come after you shut the phone." with a `NEW BOOKING · 11:14 PM` card and the 29-second booking film as a full-width poster.

**08 Calendar filling** — micro label `SATURDAY, WITHOUT YOU`; a 4-court × 4-hour grid animating to "11 of 16 slots booked", with rates on each booked slot and a legend (**Booked and paid / Still open** — never colour alone).

**09 What you actually earned** — "You should not have to add up the register to know your month." with the analytics screenshot.

**10 What commission costs** — the moment number **₹2,40,000** at 160px: "A year, in commission, for a venue doing ₹2,00,000 a month through someone else's app. On KonnexPlay the same venue pays ₹48,000 a year and keeps the rest." Plus a two-bar comparison and the calculator (see Interactions).

**11 Your own booking website** — "One link, everywhere a player looks for you." Four small mocks with a teal highlight cycling between them every 1.8s: an Instagram bio row, a Google-listing result with a "Book a slot" button, a WhatsApp reply bubble, and a navy "Scan to book" gate plate. Followed by the six sport links.

⚠️ These are deliberately **generic mocks, not brand logos.** Instagram / Google / WhatsApp marks are trademarks and were intentionally not used. If the client wants real marks, take them from each company's official brand resource page.

**12 Closing** — "Twenty minutes, on your own venue's data." with an inline short demo form (name, mobile, venue, city, courts, sport) so the primary conversion exists on the home page itself.

### 2 · Book a demo (`/book-a-demo`)

The highest-value page. **The form is first in the DOM and visually level with the H1** — on mobile the user lands on the form, not on copy. Do not move it below the explanation.

- H1: "See KonnexPlay in 20 minutes."
- Explanation of exactly what happens on the call: the venue's booking flow, how players book, the owner calendar, payments, reports, questions.
Card treatment: white on navy, **4px teal top rule**, `0 30px 70px rgba(0,0,0,.28)`, 34px/38px padding. Header inside the card: `BOOK YOUR DEMO` micro label, "Four fields, thirty seconds." at Outfit 800/24px — **this number must equal what the counter tracks** (name, phone, venue, city); courts and sport carry defaults and the booking-method select is optional, and a live **"n of 4 done"** counter on the right that turns `#088064` when complete.

Controls — **no boxed inputs**. Every text field is an underline field: transparent background, `border-bottom: 1.5px solid #C9CBD1`, 19px/500 value text, an 11px/0.14em caps micro-label above, and a real placeholder. On focus the underline becomes `2px solid #0DC59A` (padding compensates so nothing shifts).

- **Name** · underline field, placeholder "Rahul Mehta"
- **Mobile** · a static `+91` at 19px/600 sharing one underline with the input (wrapper is `display:flex; align-items:baseline`; the input **must** carry `box-sizing: border-box` or its 46px min-height applies to the content box and the row renders 66px tall against its 46px siblings); `type=tel`, `inputmode=numeric`, `maxlength=10`, digits-only filtering
- **Venue name** · underline field, placeholder "Riverfront Arena"
- **City** · underline field, placeholder "Surat"
- **Courts or turfs** · a **segmented control** 1–6+ on its **own full-width row** (not a number input — faster on a phone). Selected: navy fill, white ink. Default 2. ⚠️ Do not put this beside City in a two-column grid: its min-content width is ~347px, which starves the City track to 33px in the 45%-wide form column. Buttons are `flex: 1 1 0; min-width: 0` with a 6px gap so they compress to 48px rather than wrapping.
- **Main sport** · **seven chips**, single-select (not a dropdown). Selected: mint fill `#E8FBF5`, `#066B54` ink, teal border.
- **How do you take bookings today?** · optional, the one `<select>`, styled as an underline field with `appearance: none`

Validation names exactly what is missing — "Still needed: your name, a 10-digit mobile number." — in an amber block with a `3px solid #B1382C` left rule. Submit: full-width teal, 58px, `Book my 20-minute demo →`.
- Success state: "Thanks, [first name]. We have your details." followed by what happens next.
- Below the form, two proof screenshots in **identical 16/10 frames** with `object-fit: contain` (not `cover` — cover cropped the captions), side by side at ~556px each on a 1200px canvas.
- Inputs: 1px `#C9CBD1` border, 14px padding, 17px text, **min-height 44px**.
- No sticky mobile CTA on this page.

### 3 · Pricing (`/pricing`)

Two plans, side by side (`1fr 1fr`, stacking under 820px).

**Starter — ₹12,000 per court per year.** White card, hairline border, outline CTA. Booking website + QR · one live calendar · online payments and advances · automatic confirmations · customer list · revenue and bookings report · staff logins · **no commission on your own bookings** (in `#088064`).

**Pro — ₹18,000 per court per year.** Navy card, teal `MOST VENUES CHOOSE THIS` flag in the top-right corner, teal CTA. Everything in Starter · rate plans (time bands, weekday/weekend) · seasonal and festival pricing with date ranges · memberships and member rates · tournaments with bulk blocking, deposits and discounts · expenses, profit and payment-detail reports · multi-venue one login · channel manager when it launches *(in development)*.

⚠️ **₹18,000 is a proposal awaiting client sign-off.** ₹12,000 is the client's real, confirmed price. The split is deliberately *"does your price change?"* rather than booking volume or court count — volume tiers punish growth.

Below: monthly equivalents (₹1,000 / ₹1,500 per court), four-court totals (₹48,000 / ₹72,000), a commission comparison (₹2,40,000 a year at 10% against ₹72,000 on Pro), and a six-line "Which one" decision list.

Terms: billed annually in advance per court; the 12-month term starts after a 14-day setup period; the price is held for the full term with any change applying from renewal on 30 days' notice; payment gateway charges apply. **GST is deliberately not mentioned anywhere** — the company is not registered and the site takes no position.

### 4 · Platform, 5 · FAQ, 6 · About, 7 · Contact, 8 · Resources, 9 · Research, 10 · Channel manager

Same system throughout: micro label, sentence-case headline, asymmetric split, editorial hairline lists instead of card grids, real screenshots, one CTA per page.

- **FAQ** answers are written **answer-first** for AI extraction, and each maps to a `FAQPage` schema entry.
- **Channel manager** must state plainly that it is **in development and not live**. Never imply otherwise.
- **Research** is the 2026 Surat venue report — needs research date, methodology, venue count, what was measured, findings, limitations. Do not let it imply it represents all of India.

### 11 · Sport pages ×6, 12 · City pages ×5, 13 · India page

Templated but **not** name-swapped boilerplate. Each sport page covers how that venue type operates, its specific booking problems, how players book, how the owner gets bookings, revenue, payments, retention.

### 14 · Legal (`/privacy`, `/terms`, `/refunds`)

Full drafted policies for Indian law (DPDP Act 2023 and its 2025 rules, IT Act 2000, Consumer Protection E-commerce Rules 2020). An amber notice at the top marks it as a draft pending advocate review.

⚠️ **Settlement wording is legally load-bearing.** Payments are collected through KonnexPlay's gateway account and split-settled to the venue, so the site must **never** say money goes "directly to your bank, not ours". The approved sentence is:

> "Players pay online and the money is settled to your bank account, usually within five working days. KonnexPlay does not keep any part of your booking amount."

This phrasing appears in several places across the site. Preserve it exactly.

---

## Interactions and behaviour

### Commission calculator (home, section 10)

Three inputs — `MONTHLY BOOKINGS, ₹` · `COMMISSION RATE, %` · `NUMBER OF COURTS`. Defaults ₹2,00,000 / 10% / 4.

```
commissionPerYear = monthlyBookings × (rate / 100) × 12
konnexPlayPerYear = courts × 12000
```

Two outputs, `COMMISSION, A YEAR` and `KONNEXPLAY, A YEAR`, formatted `₹` + `toLocaleString('en-IN')`, updating live, with a two-bar comparison scaled to the larger value. Footnote states the ₹12,000 price, the waived ₹5,000 setup, that there is no commission on the venue's own bookings, and that gateway charges apply.

### Product tour (home, section 06 — id `platform`)

Five tabs — Today · Calendar · Payment · Customers · Reports — auto-advancing every **3600ms**, each cross-fading in over 400ms. The active tab takes a **2px teal left border**; inactive tabs sit at **55% opacity**. Clicking a tab jumps to it and **cancels the auto-advance permanently**.

### Channel highlight (home, section 11)

The four link mocks cycle a teal border + `0 14px 30px rgba(13,27,62,.10)` shadow every **1800ms**.

### Register-to-screen reveal

One scroll-triggered reveal on the home page — a paper register dissolving into the product screen. The only scroll animation on the site.

### Video playback

All background videos: `muted`, `loop`, `playsInline`, `preload="metadata"`, with a poster. Force `play()` on mount and swallow the rejected promise (autoplay policies). One clip carries `data-clip-end="43"` and loops early via a `timeupdate` listener to avoid a phone popup at the tail.

### Forms

Client-side validation only in the prototype. Production needs: server-side validation, an Indian phone-format check, a spam guard, a real endpoint, and a lead notification to the client. No fake success — only confirm once the lead is actually stored.

---

## State

| State | Where | Notes |
| --- | --- | --- |
| `route` | Router | Replace with real framework routing |
| `w` (viewport width) | Every page component | Drives responsive grids in JS in the prototype — **replace with CSS media queries / container queries in production** |
| `menuOpen` | Header | Mobile menu |
| `scrolled` | Home | Sticky-CTA threshold at 700px |
| `feat` (0–4) | Product tour | Auto-advance index |
| `chan` (0–3) | Channel mocks | Auto-advance index |
| `rvCourts`, `rvValue`, `rvExtra`, `rvDays` | Calculator | Controlled inputs |
| Form fields + `submitted` | Demo page | Replace with real submission state |
| `reduced` | All animated components | From `matchMedia('(prefers-reduced-motion: reduce)')` |

**Important:** the prototype computes grid columns in JavaScript from `window.innerWidth` because the runtime does not allow CSS classes. **Do not replicate that.** Use real CSS breakpoints — it removes most of the JS state above and fixes SSR.

---

## SEO and GEO requirements

This is not a nice-to-have — it is half the brief.

- One `<h1>` per page, correct `h2`/`h3` hierarchy.
- Unique `<title>` and meta description per page; canonical URL on every page.
- Open Graph and Twitter tags with a real image.
⚠️ **Known prototype artifact:** because the whole site is one document, each visited page's `<head>` contributions persist, so after browsing you end up with several `ld+json` blocks (including two `FAQPage`) and previously-set meta in the head at once. The router sets the correct title, description and canonical per route, but the stale schema stays. This disappears the moment each page is its own server-rendered document — **do not carry any workaround across; just emit one schema block per page.**

- Structured data, **only where it matches visible content**: `Organization`, `WebSite`, `SoftwareApplication` with the ₹12,000 offer, `FAQPage` (FAQ + home Q&A), `Article` (blog and research), `BreadcrumbList`. **Never** fabricate `aggregateRating`, reviews, awards or customer counts.
- Semantic HTML, real `<a href>` links (crawlable — the hash router must go), descriptive `alt` on every image, explicit width/height, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero.
- Answer-first copy so AI search can extract: what KonnexPlay is, who it's for, how it works, whether players can book without calling, payments, commission, cost, coverage, sports, how it differs from marketplaces.
- `sitemap.xml` and `robots.txt`.
- Internal linking: Home → India → sport pages → city pages → blog/research → demo, with meaningful anchor text.

⚠️ **Unverified claims were deliberately removed.** Earlier drafts carried "208 venues, 5 cities, 6 sports". Those are not currently substantiated, so they are gone from the hero, stat rows, footer, About, FAQ, the India page and all meta descriptions. **Do not reinstate any venue count, city count or testimonial without written client confirmation, and date it when you do.**

## Accessibility

Semantic landmarks · keyboard navigation · visible focus (`3px solid #0DC59A`, 2px offset) · labelled inputs · 4.5:1 body contrast and 3:1 for headline-scale type · `prefers-reduced-motion` honoured · booking status never conveyed by colour alone (always a text label too) · minimum 44px touch targets.

## Performance

Hero video with a poster and `preload="metadata"` — never a large autoplay video on mobile data. Responsive images. Lazy-load below the fold. Self-host Outfit and Inter with `font-display: swap` in production rather than hitting Google Fonts. Target good LCP / CLS / INP.

---

## Assets

All in `assets/`, all **real client material** — no stock, no AI-generated imagery.

**Venue photography:** `venue-turf-night-wide.jpg` (floodlit box cricket at night — the hero), `venue-cage-tall-1.jpg`, `venue-cage-night.webp`, `venue-court-floodlit.webp`, `venue-pickleball-1/2/3.jpg`

**Product screenshots** (real screens from a live venue, PII masked): `shot-calendar-v4.jpg`, `shot-inventory.jpg`, `shot-rates.jpg`, `shot-analytics.jpg`, `shot-source-mix.jpg`, `shot-payments.jpg`, `shot-venue-page-v2.jpg`, `shot-checkout.jpg`, `shot-choose-sport.jpg`

**Video:** `video-1.mp4` (hero), `film-story.mp4` (the exported story film, embedded on Home), `app-demo.mp4` (player booking screen recording, 400×576 native — **never upscale it; it blurs**)

⚠️ Re-export the product screenshots at 2× from the live app for production. The bundled ones are compressed for prototyping.

## Animated films

Four brand films were built on a prototype animation engine (`animations-v3.jsx` + `konnex-*.jsx`):

1. **Nobody answered the phone** — 41s, the venue's night, a booking taking itself at 11:14 PM
2. **How a player books** — 29s, one persistent browser card whose page slides through find → sport → slot → pay → confirmed
3. **A tournament weekend** — 25s
4. **Rates in three clicks** — 20s
5. **Every court, every channel** — 27s, the channel manager story (badged *in development*)

**Do not port the engine.** Export each film to MP4 from the prototype and embed the video files, or rebuild the two or three that matter in a production motion tool. The JSX is included as a reference for the choreography and copy only.

Two hard-won lessons if you do rebuild them: never cross-fade two scenes that carry text in the same position (it reads as a double exposure — use a wipe or a sliding rail), and a UI element in the same place across scenes must be **one persistent element**, not one copy per scene.

## 3D model

`arena-3d.html` + `arena-model.js` — a three.js model of the box cricket arena built from the client's photographs, downloadable as OBJ+MTL or GLB. Optional for the site; useful for marketing material. It is an approximation from photos, not a survey.

---

## Files in this bundle

**Pages:** `Home.dc.html` · `Platform.dc.html` · `Pricing.dc.html` · `Book a demo.dc.html` · `FAQ.dc.html` · `About.dc.html` · `Contact.dc.html` · `Blog.dc.html` · `Research.dc.html` · `Channel manager.dc.html` · `Legal.dc.html` · `India.dc.html` · `Sport.dc.html` · `City.dc.html`

**Chrome and shared:** `KonnexPlay.dc.html` (router) · `Nav.dc.html` · `Footer.dc.html`

**Interactive components:** `ProductDemo.dc.html` · `BookingAnim.dc.html` · `RegisterToScreen.dc.html`

**Films:** `KonnexPlay Story.dc.html` · `Booking Film.dc.html` · `Tournament Film.dc.html` · `Rates Film.dc.html` · `Channel Film.dc.html` · `konnex-story.jsx` · `konnex-booking.jsx` · `konnex-shorts.jsx` · `konnex-channel.jsx` · `animations-v3.jsx`

**3D:** `arena-3d.html` · `arena-model.js` · `three-d-stage.js`

**Runtime (prototype only — do not port):** `support.js`

**Standalone preview:** `KonnexPlay website (standalone).html` — the entire site as one offline file. Open this first to see the intended result.

**Assets:** everything in `assets/`

---

## Suggested order of work

1. Scaffold the framework with SSR/SSG, real routes, self-hosted fonts, and the design tokens above.
2. Build the header, footer and mobile menu.
3. Build Home section by section, in narrative order.
4. Build the demo page and wire a real lead endpoint — this is the revenue path.
5. Build Pricing, then Platform, FAQ, About, Contact.
6. Build the sport, city and India templates with genuinely distinct content.
7. Blog, research, legal (three routes).
8. SEO pass: titles, descriptions, canonicals, OG, schema, sitemap, robots.
9. Accessibility and performance pass.
10. Embed exported film MP4s.

## Open questions for the client

1. Advocate review of the three policies (company details are filled in).
2. Sign-off on **₹18,000** for Pro, and confirmation that memberships and tournaments should sit behind it.
3. Written confirmation (with a date) of any venue count, city coverage or testimonial before it goes back on the site.
4. Real customer quotes, if any exist — nothing was fabricated.
5. Whether to license official Instagram / Google / WhatsApp brand marks for section 11.
6. The blog article backlog — the hub is built, the articles are not written.
