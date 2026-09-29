# Gafferboard SEO action plan

From the audit on 2026-09-29. See [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md) for the evidence.

## Critical (now)

1. **Point the domain at Vercel.** In the Vercel project (`squad-board`), add `gafferboard.com` and `www.gafferboard.com`. Then either add the records Vercel shows in SiteGround DNS (apex `A 76.76.21.21`, `www` `CNAME cname.vercel-dns.com`, or whatever Vercel lists for the project), or switch the nameservers to Vercel. Pick apex or www as primary and let Vercel 308 the other.
2. **Redeploy production.** The build settings are correct (Next.js preset). The live deployment is 4 days old and was made from the CLI, so push and run `vercel --prod`. squad-board.vercel.app is someone else's project; this one is squad-board-pied.vercel.app.
3. **Commit and ship the working tree.** The landing, privacy and credits pages, robots and sitemap exist only locally.

## High (this week)

4. **Share image.** Done 2026-09-29. Add `src/app/opengraph-image.tsx` (1200x630, brand colours and visor mark, positioning line from brand.md). Set `twitter: { card: "summary_large_image" }` in the root metadata.
5. **Per-page Open Graph.** Done 2026-09-29. In each route's `metadata`, set `openGraph: { title, description, url }` so a shared `/privacy` link does not unfurl as the homepage. Align the homepage `og:description` with its meta description.
6. **Homepage title and H1 keywords.** Done 2026-09-29. Title: `Gafferboard - line-ups and team sheets for grassroots football`. Keep the H1 line and add an eyebrow or subline naming the category. Strings go in `src/constants/content/landing.ts`.
7. **Noindex `/board`.** Done 2026-09-29. Add `robots: { index: false, follow: true }` to `src/app/board/page.tsx` metadata and remove `ROUTES.board` from `sitemap.ts`.
8. **Structured data.** Done 2026-09-29. Add `WebApplication` + `WebSite` + publisher JSON-LD to the homepage. Keep the data in `src/constants/seo.ts`.

## Medium (this month)

9. **Manifest icons.** Done 2026-09-29. Add 192, 512 and maskable 512 PNGs to `manifest.ts` so the board installs as an app.
10. **Font preloads.** Partly done 2026-09-29: the unused Saira Condensed 500 is gone, 5 preloads instead of 6. Cut the six preloaded font files down to the weights used above the fold.
11. **Landing bundle.** Done 2026-09-29: the demo pulled in the board provider through PitchMarkings; splitting it out saved about 9 KB gzipped. The rest is the React and Next runtime. Check why the mostly static homepage ships ~220 KB of gzipped JS. Make sure board-only code and framer-motion are not in its client graph.
12. **Search vocabulary in the copy.** Work "line-up", "team sheet", "formation", "substitutions" and the formats (5, 7, 9, 11-a-side) into the landing sections, in the Gaffer's voice.
13. **One definitional sentence plus a short FAQ** on the homepage, for AI answers and for coaches skimming.
14. **Submit to Google Search Console and Bing Webmaster Tools** once the domain resolves. Submit the sitemap and run PageSpeed Insights for real CWV.

## Low (backlog)

15. Drop the inherited canonical from the 404 page. Done 2026-09-29.
16. `poweredByHeader: false` in `next.config.ts`. Done 2026-09-29.
17. Add `lastModified` to sitemap entries. Done 2026-09-29.
18. Add `/llms.txt` with a plain summary and links. Done 2026-09-29.
19. Strengthen E-E-A-T on `/credits`: who built it and their connection to grassroots football.
20. Plan format landing pages ("7-a-side formations", "9-a-side formations") that open the board preset to that format. This is where search demand is for a tool like this.
21. **Contrast of Dimmer.** Lighthouse: `#67675F` on Board is 3.47:1, under the 4.5:1 small text needs. A brand.md decision.
22. **Player button names.** Done 2026-09-29: demo and board pitch buttons now start their accessible name with the visible number and name.
