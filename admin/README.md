# Site settings panel

A small admin page for changing the details that change most often, without
touching code. Open it at:

**<https://anispms.github.io/konnexplay-website/admin/>**

The left side is a form. The right side is the real website, updating as you
type, so you see the change before anyone else does. Nothing is published until
you press **Save and publish**.

## What you can change here

| Setting | Where it shows |
| --- | --- |
| Phone and WhatsApp number | Every page, call links, and the demo form handoff |
| Email address | Contact page, footer, email links |
| Instagram page | Footer |
| Starter price | Home, pricing, sport and city pages |
| Pro price | Pricing page |
| Setup fee waived | Home and pricing |
| Registered address | Legal pages |
| Lead capture URL | Where demo requests are saved |
| Scripts in `<head>` | Every page — verification tags, Google Tag Manager, Meta Pixel, and similar |
| Scripts at the start of `<body>` | Every page — for things like GTM's `<noscript>` fallback |
| Organization structured data (JSON-LD) | Every page |
| Per-page title, description, URL slug, structured data | One page at a time: Home, Platform, Pricing, Book a demo, FAQ, About, Contact, Resources, Blog, Research report, Channel manager, India, Legal |

Change the phone number once and it changes in every one of those places at
the same time, including the `tel:` links and the WhatsApp message the demo
form opens.

A page's URL slug is an *extra* address it also answers to — for example
giving Book a demo the slug `book-a-demo` makes `/book-a-demo` work
alongside its usual `/demo`, and search engines are pointed at whichever one
is set. The usual address never stops working, and sport, city and
individual blog post pages aren't covered yet (each blog post already has
its own title and excerpt in the Blog posts section above).

## What you cannot change here

Body copy, headlines, photographs, page layout and the films. Those live inside
the design files. Editing them needs the rebuild described in the main README,
which is what turns this into a full content management system.

This panel is deliberately limited to the handful of values that change often
and appear in many places at once, where getting them out of sync causes real
damage.

## First time: connecting

Saving writes to your GitHub repository, so the panel needs permission once.

1. Open <https://github.com/settings/personal-access-tokens/new>
2. **Token name**: anything, for example `site settings panel`
3. **Expiration**: 90 days is sensible. You will repeat this step when it expires.
4. **Repository access**: Only select repositories, then pick `konnexplay-website`
5. **Permissions** &rarr; Repository permissions &rarr; **Contents**: Read and write
6. Generate the token and copy it
7. Paste it into the panel and press **Connect**

The token is stored in your browser only. It is sent to GitHub and nowhere
else. The panel is a static page: there is no server in between and nobody
else can read it.

### Treat the token like a password

Anyone holding it can change this repository. Do not paste it into a chat, an
email, or a shared machine. If you think it has leaked, open the same GitHub
settings page and delete it; the panel will simply ask for a new one.

Use **Forget token** before handing your laptop to anyone.

## Saving

Press **Save and publish**. The panel writes `content.json` to GitHub, which
triggers a rebuild. The live site shows the change in about a minute. Your
preview shows it immediately.

If two people edit at once, the second save is refused rather than silently
overwriting the first. Reload and make the change again.

## If something goes wrong

**"That token was not accepted."** It is wrong, expired, or was created for a
different repository. Make a new one.

**"That token can read but not write."** The Contents permission is missing or
set to read only. Edit the token's permissions on GitHub.

**"Someone else changed the file."** Another save landed first. Reload the page
and reapply your change.

**The preview is blank.** Press **Reload** in the preview bar. The site takes a
second or two to render because pages are fetched as you navigate.

**A change did not appear on the live site.** Wait a minute, then hard refresh.
GitHub Pages caches files for about ten minutes, so an old copy can linger in
your browser.

## Undoing a change

Every save is a commit, so nothing is ever lost. The history is at
<https://github.com/anispms/konnexplay-website/commits/main/content.json>.
Ask a developer to revert a commit, or simply type the old value back in and
save again.
