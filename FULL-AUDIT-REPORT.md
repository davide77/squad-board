# Gafferboard SEO audit

Date: 2026-09-29
Target: https://gafferboard.com
Business type: free consumer web app (sports tool for grassroots football coaches). Not a local business, so the local SEO pass was skipped.

## How this was audited

- **gafferboard.com does not resolve.** It returns no A, AAAA or CNAME record from any resolver, including 8.8.8.8. The domain is registered at Tucows (created 2026-09-25) and delegated to `NS1/NS2.SITEGROUND.NET`, but SiteGround has no record pointing at Vercel.
- **Correction:** squad-board.vercel.app is not this project. It serves an unrelated Vite app. This project's production alias is squad-board-pied.vercel.app, which serves the Next.js Gafferboard, and `gafferboard.com` and `www.gafferboard.com` are already attached to it in Vercel. Vercel reports the domain as not configured: it wants `A gafferboard.com 76.76.21.21`, or the nameservers switched to `ns1/ns2.vercel-dns.com`.
- Because nothing indexable is live, the audit below is of the **current working tree** (including uncommitted work), built with `next build` and served with `next start`. That covers 4 indexable routes plus robots, sitemap, manifest and 404. There are no field Core Web Vitals, because the site has no traffic.

## Executive summary

| | Score |
| --- | --- |
| Live site today | **~5 / 100** (nothing reachable to index) |
| Working tree, if shipped as is | **58 / 100** |

| Category | Weight | Score |
| --- | --- | --- |
| Technical SEO | 22% | 80 |
| Content quality | 23% | 55 |
| On-page SEO | 20% | 60 |
| Schema / structured data | 10% | 10 |
| Performance | 10% | 75 |
| AI search readiness | 10% | 40 |
| Images | 5% | 60 |

The technical groundwork is good: static prerendering, a proper robots and sitemap, per-route canonicals, security headers, `lang="en-GB"`, a real 404 with `noindex`. What is holding the build back is how it is found and shared (no keywords, no share image, no schema), not how it is built.

### Top 5 critical issues

1. The domain has no DNS record pointing at Vercel, so nothing loads.
2. The deployed build is 4 days old and lacks the landing, privacy and credits pages and every fix since.
3. There is no Open Graph image anywhere, so every WhatsApp, iMessage and social share is a bare text card. For a product that spreads by coaches sending links to each other, this is the biggest missed trick.
4. Every subpage inherits the homepage's `og:title` ("Gafferboard") and `og:url` (`https://gafferboard.com`), so a shared `/privacy` link unfurls as the homepage.
5. There is no structured data (no `WebApplication`, `WebSite` or `Organization`).

### Top 5 quick wins

1. Add `src/app/opengraph-image.tsx`, one branded card that every page inherits. Switch `twitter.card` to `summary_large_image`.
2. Give each route its own `openGraph: { title, url }` in its `metadata` export.
3. Put the words people search for in the homepage `<title>`: "line-up", "team sheet", "grassroots football".
4. Add a `WebApplication` JSON-LD block to the homepage, marked free (`offers.price: 0`).
5. Add `icons` to the manifest so the site can be installed as an app. `start_url: /board` already assumes it can be.

## Technical SEO

### Crawlability and indexability

| Check | Result |
| --- | --- |
| robots.txt | `Allow: /`, sitemap declared. Good. |
| sitemap.xml | 4 URLs, absolute, on the right host. No `lastModified`. Includes `/board` (see below). |
| Canonicals | Present and self-referencing on `/`, `/board`, `/privacy` and `/credits`. |
| 404 | Real 404 status, `noindex`. It also carries `canonical: https://gafferboard.com`, inherited from the root layout. This is harmless but contradicts the noindex, so drop it. |
| Rendering | Every route is static HTML. The landing, privacy and credits pages are fully server-rendered text. |
| `/board` | Client only. It renders 5 words of HTML (skip link plus shell) yet it is canonical, indexable and in the sitemap. It is thin to a crawler and competes with the homepage for the same intent. |
| Trailing slash | The canonical for home is `https://gafferboard.com` with no slash. That is consistent. |
| www | Decide `www` vs apex when adding the domain in Vercel, and redirect one to the other with a 308. |

**Recommendation for `/board`:** add `robots: { index: false }` to its metadata and remove it from the sitemap. The homepage is the page that should rank. `/board` is the tool behind it.

### Security

`next.config.ts` sends `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and a `frame-ancestors`/`base-uri`/`form-action`/`object-src` CSP. Vercel adds HSTS with preload. This is strong for a static site. Minor: set `poweredByHeader: false` to drop `X-Powered-By: Next.js`.

### Mobile

The viewport is set by Next with `viewport-fit=cover`. `theme-color` is set. The manifest has **no `icons` array**, which fails Chrome's installability check. `apple-icon.png` exists, so iOS is fine.

## Content quality

| Page | Words | Notes |
| --- | --- | --- |
| `/` | ~394 | Strong, distinctive voice. Four step "how it works" section, privacy and sharing sections. Thin for competing on "football line-up app" type queries. |
| `/privacy` | ~352 | Genuinely useful. "Most squads are children" is exactly the trust signal parents and clubs look for. |
| `/credits` | ~63 | Fine as a credits page. Names the author, which helps E-E-A-T. |
| `/board` | 5 | App shell only. |

**E-E-A-T:** Experience and trust come across well: no accounts, no cookies, and care about children's data. Expertise and authority are thin. Nothing says who is behind it or why they know grassroots football. A sentence or two on the credits page ("built by a coach, for coaches", if true) would help.

**Search intent gap:** the copy talks like the Gaffer, which is right for the brand, but it hardly uses the nouns coaches type into search. "Line-up", "team sheet", "formation", "substitutions", "grassroots", "under 9s" and "5-a-side / 7-a-side / 9-a-side / 11-a-side" are all brand vocabulary (brand.md already uses "team sheet" and "line-up"). They should appear in headings and body at least once each.

**Content to add (backlog):** a short FAQ on the homepage ("Does it work offline?", "Do parents need an account?", "Which formats does it do?"), and later one page per format (for example "7-a-side formations for grassroots football"). Format pages are where search volume sits for a tool like this.

## On-page SEO

### Titles

| Page | Title | Issue |
| --- | --- | --- |
| `/` | Gafferboard - pick the team on the touchline | On brand, but it has no category keyword. Nobody searches "touchline". |
| `/board` | Board · Gafferboard | Fine once noindexed. |
| `/privacy` | Privacy and safety · Gafferboard | Good. |
| `/credits` | Credits · Gafferboard | Good. |

Suggested home title, in the brand's own vocabulary: `Gafferboard - football line-ups and team sheets for grassroots coaches` (68 characters, which may truncate slightly on mobile; `Gafferboard - line-ups and team sheets for grassroots football` is 62).

### Meta descriptions

Home, privacy and credits have their own descriptions. `/board` and the 404 fall back to the site description. OK.

### Headings

- Home H1: "Big game Saturday? Tap a player, let's have a look." One H1, which is good, but it has no topic words. Keep the line and add a small eyebrow or subline above it that names the thing, for example "Football line-up and team sheet app".
- The H2 and H3 hierarchy is clean on every page.

### Open Graph and social

- No `og:image` and no `twitter:image` on any page. `twitter:card` is `summary`.
- `og:title` is "Gafferboard" and `og:url` is the homepage on **every** page, because `openGraph` is only set in the root layout and Next does not merge it per route.
- The homepage `og:description` differs from its meta description (it is missing "grassroots" and "No account, nothing to install"). Keep them aligned.

### Internal linking

The footer links Home, Board, Privacy and Credits on every page. The homepage links to `/board` through its CTAs. That is fine for a 4 page site. The only external link is to originsocialclub.com.

## Schema and structured data

None found. Recommended:

- **Homepage:** `WebApplication` (`name`, `url`, `description`, `applicationCategory: SportsApplication`, `operatingSystem: Any`, `offers: { price: 0, priceCurrency: GBP }`, `inLanguage: en-GB`, `isAccessibleForFree: true`). Add a `WebSite` node with `name` and `url`, which helps Google show "Gafferboard" as the site name.
- **Publisher:** `Organization` or `Person` for Origin Social Club / Davide Domenghini, linked from `WebApplication.publisher`.
- **Later:** `FAQPage` markup is no longer shown as rich results for most sites, but the Q&A content still helps AI answers, so write the FAQ for readers and skip the rich result expectation.

Keep the JSON-LD data in `src/constants/seo.ts` and render it from `page.tsx` with a `<script type="application/ld+json">`, in line with the "no hardcoded values" rule.

## Performance

Lab only (local `next start`, no field data):

- Every route is prerendered static HTML with `s-maxage=31536000`. TTFB on Vercel's CDN will be excellent.
- Home ships about **220 KB of gzipped JS and CSS** (11 files), and `/board` about 208 KB. That is reasonable for a React app, though heavy for a landing page that is mostly text. Check whether framer-motion or the board code is being pulled into the landing bundle.
- **Six font files are preloaded** (Barlow 400/500/600 and Saira Condensed 500/600/700). They compete with the hero for bandwidth on a 4G touchline connection. Trim the weights to the ones actually used above the fold, or set `preload: false` on the weights used only lower down.
- The only image is the 40px SVG logo. It is preloaded and has width and height set, so no CLS risk.

Measure CWV with PageSpeed Insights once the domain resolves.

## Images

- One `<img>` per page (the logo), `alt=""`, marked decorative next to the wordmark text. Correct.
- The share image is missing (see On-page). Brand.md sets the palette and type, so a 1200x630 card with the visor mark and the positioning line can be generated in `opengraph-image.tsx` with `ImageResponse`.
- The manifest has no icons (192 and 512 PNG, plus a maskable one).

## AI search readiness

- robots.txt allows every crawler, including GPTBot, ClaudeBot and PerplexityBot. Good.
- There is no `/llms.txt`. For a 4 page site this is low value, but it costs little: a short summary of what Gafferboard is, who it is for, what it does and does not store, and links to the 3 content pages.
- Citability is low. The copy is conversational and instruction-led, so there is no self-contained answer to "what is a good app for picking a grassroots football team", and no plain factual sentence such as "Gafferboard is a free web app that...". Add one definitional sentence high on the homepage and a short FAQ.
- There are no brand mentions or links anywhere yet, which is expected for a site registered this week.
