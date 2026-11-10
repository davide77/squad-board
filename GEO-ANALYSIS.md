# GEO analysis: gafferboard.com

Checked 3 November 2026 against the live site and the repo at `637e3b9`.

## 1. GEO readiness score: 63/100

| Criterion | Weight | Score | Why |
| --- | --- | --- | --- |
| Citability | 25% | 55 | A good quotable definition exists, but only in JSON-LD and `/llms.txt`, never in the visible page. FAQ answers are 10-40 words. Format pages are 87 words. |
| Structural readability | 20% | 70 | Clean H1 > H2 on every page, FAQ section, shape lists. Headings are slogans ("Tell the parents") rather than questions a coach types. |
| Multi-modal | 15% | 70 | Interactive demo board, 38s film, OG card. No image or diagram of a formation on the format pages. |
| Authority and brand | 20% | 30 | Person schema for the maker, credits page, dated privacy page. Zero third-party mentions: a search for "Gafferboard" returns nothing about the product. |
| Technical accessibility | 20% | 95 | Everything is server rendered, all AI crawlers allowed, `llms.txt` live, sitemap live. |

The technical side is close to done. The score is held back by what the pages say and by nobody else saying it.

## 2. Platform breakdown

| Platform | Score | Note |
| --- | --- | --- |
| Google AI Overviews | 55 | Depends on ranking top 10 first. Format pages are too thin to rank for "7-a-side formations". |
| ChatGPT search | 35 | Leans on Wikipedia and Reddit. Gafferboard has neither, so it has nothing to corroborate. |
| Perplexity | 35 | Reddit is nearly half its citations. No Reddit footprint. |
| Bing Copilot | 50 | Same as Google, plus IndexNow would help (not set up). |

## 3. AI crawler access

`robots.txt` is `User-Agent: * / Allow: /` with the sitemap. Live requests with GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot user agents all return 200, so Vercel's bot protection is not blocking them.

Nothing to change. If you ever want to opt out of training while staying in AI search, add `Disallow: /` for `CCBot`, `Google-Extended` and `anthropic-ai` only. Not recommended now: for a new brand, being in training data is a plus.

## 4. llms.txt

Present at `/llms.txt`, generated from `LLMS_TXT` in `src/constants/seo.ts`, well formed: title, one-line summary, three plain paragraphs, page list. Good.

Small additions worth making:

- A `## Key facts` list (free, no account, formats 3/5/7/9/11-a-side, 15 shapes at 11-a-side, data stays on the device, UK, made by a grassroots coach). Short facts are what models lift.
- A `## Contact` line with the email and the Instagram link.

## 5. Brand mentions

| Source | Present |
| --- | --- |
| Wikipedia / Wikidata | No |
| Reddit | No |
| YouTube | No |
| LinkedIn | Not linked |
| Instagram | Yes, in `sameAs` |
| Product Hunt / app directories | No |

A web search for "Gafferboard" returns nothing about the product. A search for "free app grassroots football line-up subs minutes" returns about ten competitors, nearly all App Store listings (SubAssist, Coach Blitz, Soccer Time!, Astuten, Starting Lineup, Pitch1, FairPlayTime). AI answers to that question are built from those listings, so Gafferboard is currently invisible to them however good the site is.

## 6. Passage-level citability

What a model can lift today:

- **Homepage FAQ** - "Which formats does it support?" (40 words) is the best passage on the site. The others are under 30 words and too thin to be cited alone.
- **Privacy page** (979 words, dated 20 October 2026) - the strongest page for citation. "Gafferboard keeps no database of squads..." is a clean, self-contained answer.
- **Format pages** - 87 words each. Nothing long enough to be a passage.

What is missing: the `DEFINITION` sentence in `seo.ts` ("Gafferboard is a free web app for grassroots football coaches...") is exactly the "X is..." form AI engines quote, and it does not appear anywhere in the visible text. The hero opens with "Pick the team on the touchline. A matchday board for grassroots coaches."

## 7. Server-side rendering

All good. With no JavaScript, the homepage serves 485 words of main content including the demo team, the call-up preview and the FAQ. Format pages serve their full text and shape list. `/board` is client-only but is noindexed and left out of the sitemap, which is right.

## 8. Top 5 highest-impact changes

1. **Put the definition on the page.** Add "What is Gafferboard?" as the first FAQ item, with `DEFINITION` plus one more sentence as the answer. One edit to `FAQ` in `src/constants/content/landing.ts` updates the page and the FAQPage JSON-LD together. Effort: minutes.
2. **Grow the format pages to 350-500 words.** They are the pages that match real searches ("7-a-side formations"), and AI engines skip anything under about 130 words. See section 10 for the sections to add. Effort: an afternoon of writing.
3. **Get mentioned off-site.** In order of payoff for effort:
   - Repost the Reels as YouTube Shorts on a Gafferboard channel, with the URL in the description. YouTube mentions are the strongest single signal for AI citation.
   - Answer real questions in r/bootroom and r/SundayLeague and the UK grassroots Facebook groups as a coach, mentioning the board where it fits. Not posting ads.
   - A Product Hunt launch, and a listing on the "best grassroots football apps" roundups that show up in the competitor search.
4. **Widen `sameAs`.** Add YouTube and LinkedIn (the maker's) to the WebSite and Person entities once they exist. This is how models join "Gafferboard" mentions on other sites back to gafferboard.com.
5. **More question-shaped FAQ entries.** Coaches ask AI tools questions like these, and each answer should be 40-80 words:
   - How do I give every player fair minutes?
   - What format do under 9s play?
   - Can I send the team to the parents' WhatsApp group?
   - Does it work without signal at the ground?
   - Can two coaches share one board?

## 9. Schema recommendations

Already in place on the homepage: `WebSite`, `WebApplication` (free offer, audience), `Person` (maker), `FAQPage`. All solid.

Add:

- **Format pages:** a `WebPage` with `dateModified`, `about` (the format), `isPartOf` the `#website`, and a `BreadcrumbList` (Home > 7-a-side). Today they carry no JSON-LD.
- **`ItemList`** of the shapes on each format page, so "11-a-side formations" maps to a structured list.
- **`sameAs` on `#maker`** (LinkedIn) and an `Organization` node for Gafferboard itself with the logo, so the brand is an entity and not only an app.
- Keep FAQPage. It no longer earns rich results for most sites, but AI engines still read it.

## 10. Content reformatting suggestions

**Homepage hero.** Keep the headline. Under "A matchday board for grassroots coaches." the subtitle is good, but nowhere on the page says "free web app" in one sentence. The FAQ fix in change 1 is the lowest-risk way to add it without touching the hero's voice.

**Format pages** (`src/constants/content/formats.ts`). Add, per format:

- A question H2 with a self-contained 130-160 word answer, e.g. "What is the best 7-a-side formation for under 10s?" - name two or three shapes from the board and say what each is for (balance, width, attacking).
- "How long is a 7-a-side match?" with the FA match length, pitch size and rolling-subs rule for that age group. **Check every number against the FA's current youth football rules before shipping.**
- One line per shape in the shape list (what it suits), turning the bare chips into a list a model can quote.
- A visible "Last updated" date, like the privacy page has.

**Sitemap.** `CONTENT_UPDATED` is 30 September but the privacy page says 20 October. Bump it when the format pages change, or give each page its own date.

**Duplicate heading.** The homepage H1 and the first H2 both read "Pick the team on the touchline." Harmless for crawlers, slightly muddy for passage extraction.
