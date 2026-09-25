# Gafferboard - project instructions

## Stack

- **Next.js 16**, App Router, React Server Components by default.
- **React 19.2**. No `forwardRef`, no `React.FC`, no legacy patterns. See "React patterns" below.
- **TypeScript**, `strict: true`. Path alias `@/*` maps to `src/*`.
- **Sass** via a hand built, token driven style layer. No Tailwind, no CSS-in-JS, no component library.
- **framer-motion 13** for the motion layer (the picker sheet and the toast).

Commands: `npm run dev`, `npm run build`, `npm run lint`.

Imports use `@/...` across folder boundaries (`@/constants/config`, `@/lib/hooks`) and a relative path only for a sibling in the same folder (`./cx`, `../Button`).

## Brand: single source of truth is `brand.md`

The Gafferboard brand (positioning, voice, colours, typography, logo) is defined in **[brand.md](brand.md)** at the repo root. Everything else (SCSS tokens, JSX components, copy) is derived from it.

**Always read [brand.md](brand.md) before:**

- writing copy (page content, metadata, alt text, emails, social posts, PR descriptions, commit messages that ship user-facing text).
- generating any visual asset (images, OG cards, posters, slide decks, PDFs, banners).
- introducing or changing a colour, font, or layout primitive.
- auditing existing copy or visuals for brand consistency.

### Where the brand lives in this repo

- [brand.md](brand.md) - narrative source of truth. Update here first.
- [src/styles/abstracts/_colors.scss](src/styles/abstracts/_colors.scss) - interface colour map. Mirrors `brand.md`. Keep in sync. The `kit*` keys read custom properties, because the coach picks the club colour at runtime.
- [src/styles/abstracts/_typography.scss](src/styles/abstracts/_typography.scss) - font stacks, size / weight / line-height / tracking scales.
- [public/brand/](public/brand/) - the logo files. The favicon and Apple icon in `src/app/` are made from the same mark.
- [src/constants/brand.ts](src/constants/brand.ts) - the club colours the coach can pick, the theme colour and the logo. The default kit is mirrored in `$kit-defaults` in `_colors.scss`.
- [.claude/skills/brand-guidelines/SKILL.md](.claude/skills/brand-guidelines/SKILL.md) - invoked when styling an artifact. Defers to `brand.md`.
- [.claude/skills/brand-voice/SKILL.md](.claude/skills/brand-voice/SKILL.md) - invoked when writing or auditing copy. Defers to `brand.md`.

If work needs to deviate from the brand, stop and flag it before shipping.

## Styling: the decision ladder

**Every styling decision goes through these three steps, in order. Do not skip to step 3.**

### Step 1 - use a utility class in the JSX

Layout, spacing, alignment, display, colour, type size / weight / leading / tracking, alignment, radius, reading measure: all of it already exists as a class. Put it in `className`. Do not write CSS for it.

```tsx
<div className="is-flex is-align-baseline is-justify-between has-gap-3 has-mb-3">
  <h2 className="text-xl tracking-heading">{SHAPE.heading}</h2>
  <span className="text-sm is-dim is-tabular">{SHAPE.xiCount(onPitch)}</span>
</div>
```

### Step 2 - if the value does not exist, extend the token map, then use the generated class

A colour, spacer, size, weight, leading or tracking that is not in a map is added to the map in `src/styles/abstracts/` first. The `@each` loops then generate the class for free. Never hardcode the literal.

### Step 3 - only what a class genuinely cannot express goes in a global component file

`@keyframes`, pseudo-elements (`::before`, `::after`), container queries, per-instance `var()` custom properties, `clip-path`, transitions, gradients, composed chrome internals (button, field, picker sheet, pitch). These go in a **global BEM file** under [src/styles/components/](src/styles/components/), registered with `@forward` in [src/styles/components/_index.scss](src/styles/components/_index.scss).

Even in that file, anything a utility covers still belongs in the JSX.

### Never write a new `.module.scss`

**A component does not get a sibling `.module.scss`. New ones are never written.**

- A component is styled by utility classes in its JSX.
- What a class cannot express goes in `src/styles/components/_kebab-name.scss` as BEM (`__` element, `--` modifier).
- There are **no `.module.scss` files**. Do not introduce one.

[src/components/Button.tsx](src/components/Button.tsx) is the pattern to copy for the shape of the JSX: the utilities carry layout and type, and [_button.scss](src/styles/components/_button.scss) carries only the variant chrome.

### The utility classes that exist

| Family | Classes | Source |
| --- | --- | --- |
| Display | `is-block` `is-inline` `is-inline-block` `is-grid` `is-inline-grid` `is-hidden`, plus `is-{sm\|md\|lg}-{same}` | [utilities/_display.scss](src/styles/utilities/_display.scss) |
| Flex | `is-flex` `is-inline-flex` `is-flex-column` `is-flex-row` `is-flex-wrap` `is-flex-nowrap` `is-flex-1` `is-shrink-0` `is-min-w-0` | [utilities/_flex.scss](src/styles/utilities/_flex.scss) |
| Flex alignment | `is-justify-{center\|between\|start\|end\|around}` `is-align-{center\|start\|end\|stretch\|baseline}` `is-self-{same}` | [utilities/_flex.scss](src/styles/utilities/_flex.scss) |
| Flex responsive | `is-flex-{sm\|md\|lg}` `is-flex-{bp}-{column\|row}` `is-justify-{bp}-{name}` `is-align-{bp}-{name}` | [utilities/_flex.scss](src/styles/utilities/_flex.scss) |
| Spacing | `has-{m\|p}-{n}` `has-{mt\|mb\|ml\|mr\|my\|mx}-{n}` `has-{pt\|pb\|pl\|pr\|py\|px}-{n}`, plus `has-{prop}-{sm\|md\|lg}-{n}`. `n` is 0-11 on the 4px scale | [base/_measures.scss](src/styles/base/_measures.scss) |
| Gap | `has-gap-{n}` | [base/_base.scss](src/styles/base/_base.scss) |
| Text size | `text-{2xs\|xs\|sm\|base\|md\|lg\|xl\|2xl\|3xl\|4xl\|5xl\|6xl\|hero}`. 11px to 42px for the board, body is `md` (15px) | [base/_base.scss](src/styles/base/_base.scss) |
| Font | `has-font-{regular\|medium\|semibold\|bold}` `has-font-{headline\|body}` `is-tabular` | [base/_base.scss](src/styles/base/_base.scss) |
| Leading / tracking | `leading-{tight\|compact\|snug\|normal\|relaxed\|loose}` `tracking-{normal\|number\|tag\|heading\|group\|caps}` | [base/_base.scss](src/styles/base/_base.scss) |
| Text | `text-{left\|center\|right\|justify}` `uppercase` `lowercase` `capitalize` `is-truncate` | [base/_base.scss](src/styles/base/_base.scss) |
| Colour | `is-{name}` (text), `bg-{name}` (background), `has-border-{name}` (border colour), for every key in `$theme-colors`: `board` `board-2` `board-3` `chalk` `dim` `dimmer` `out` `kit` `kit-ink` `kit-edge` `kit-soft` `edge` `rule` `black` `text` `text-muted` `keeper-edge` `pitch-top` `pitch-bottom` | [abstracts/_colors.scss](src/styles/abstracts/_colors.scss) |
| Radius | `has-radius-{none\|sm\|field\|panel\|sheet\|pill}` | [utilities/_radius.scss](src/styles/utilities/_radius.scss) |
| Measure | `measure-{52\|62\|72}ch` `max-w-720` `is-mx-auto` `is-w-full` | [base/_base.scss](src/styles/base/_base.scss) |
| Containers | `container` `container-fluid` `container-sm` `container-lg` | [layout/_container.scss](src/styles/layout/_container.scss) |
| Accessibility | `sr-only` `skip-link` | [utilities/_sr-only.scss](src/styles/utilities/_sr-only.scss) |

If you are unsure a class exists, grep the style layer before writing CSS. If it does not exist and the value is on a token scale, extend the map and let the loop generate it.

### SCSS architecture: single source of truth is `scss-utility-architecture`

The full conventions document is **[.claude/skills/scss-utility-architecture/SKILL.md](.claude/skills/scss-utility-architecture/SKILL.md)**. Invoke that skill before:

- adding or editing any `.scss` file.
- adding or removing a colour, spacer, font size / weight, line-height, tracking, breakpoint, radius or z-index token.
- generating new utility classes or extending an existing family.
- writing responsive behaviour (container queries vs viewport media queries).

Non-negotiables it enforces:

- Values go through accessors: `color()`, `tint()`, `spacer()`, `font-size()`, `font-weight()`, `line-height()`, `tracking()`, `bp()`, `z()`. No raw hex, no raw px outside the scale.
- Kit colours are custom properties, so translucent kit tints use `tint(kit, 13%)` (`color-mix`), never `rgba()`.
- `abstracts/` emits no CSS, with one documented exception: [_colors.scss](src/styles/abstracts/_colors.scss) generates the colour utilities next to the map they come from. Do not add a second exception.
- Utility families are generated by `@each` over a map. Extend the map first, then the loop.
- Reusable components (cards, tiles, rails) respond to their own container (`@container`, `cqi`), not the viewport. Only page chrome uses `@include min(bp(...))`.

### Do not convert to utilities

- Declarations inside `@media` / `@include min(...)` / `@container` blocks where no responsive utility covers the property.
- Pseudo-elements, `@keyframes`, rules with `!important`.
- Button, field, picker sheet and pitch chrome internals. These are component compositions.
- Values off the token scale. Fix the value or leave the rule, do not invent a one-off utility.

## No inline style props in JSX

**Do not use `style={{ ... }}` in JSX or TSX.** Layout, spacing, alignment, sizing, opacity and text presentation go in utility classes.

### Allowed exceptions

- framer-motion driven values: `style={{ y }}` where the value is a `MotionValue` or motion template.
- Per-instance CSS custom properties: `style={{ "--x": `${slot.x}%` } as CSSProperties}` where the SCSS reads `var(--x)`. See the pitch markers in [Pitch.tsx](src/components/board/Pitch.tsx) and the club colour on [SquadBoard.tsx](src/components/board/SquadBoard.tsx).

## No hardcoded values anywhere: use `src/constants/`

**Components render data, they do not hold it.** Nothing a visitor can read, and nothing that controls behaviour, is typed into a component.

### What must come from `src/constants/`

- **Copy and strings** - headings, button labels, paragraphs, alt text, placeholders, SEO titles and descriptions, aria-labels, error and empty states, confirmation messages.
- **Structured content** - positions, formations, role fits, club colours. Components iterate over imported data.
- **Numbers and config** - thresholds, durations, intervals, counts, prices, image qualities and `sizes`, breakpoint pixel values used in JS, animation timings. No magic numbers.

### Where each thing lives

| File | Holds |
| --- | --- |
| [site.ts](src/constants/site.ts) | Product name, description, skip link |
| [seo.ts](src/constants/seo.ts) | The live URL, `https://gafferboard.com` |
| [config.ts](src/constants/config.ts) | Storage key, save debounce, drag thresholds, clock tick, toast time, limits |
| [motion.ts](src/constants/motion.ts) | Every duration, distance and easing the motion layer uses |
| [brand.ts](src/constants/brand.ts) | Club colours, the theme colour and the logo |
| [football.ts](src/constants/football.ts) | Positions, role fits, formations, how a custom marker gets its role |
| [content/board.ts](src/constants/content/board.ts) | Every string on the board: labels, hints, toasts, confirmations |

Add `routes.ts`, `nav.ts` or `ui.ts` when the app grows a second page.

Rules for these files:

- Export `as const`. Type every export so consumers get autocomplete and refactors are safe.
- Filenames kebab-case, exports `SCREAMING_SNAKE_CASE` for data, `camelCase` for helpers.
- Derive rather than duplicate. If a number appears in both SCSS and TS, say so in a comment on both sides (see `TOAST_MS` in [config.ts](src/constants/config.ts)).
- A value that is genuinely single use and internal to one component can be a module-level `const` at the top of that file, named. It still does not sit inline in the JSX.

### Allowed exceptions

- Markup contract strings: `aria-hidden="true"`, `role="status"`, `type="button"`, `data-*` used by CSS.
- `className` strings. Utility class names belong inline.
- Purely visual one-offs with no semantic meaning: an SVG `viewBox`, `tabIndex={-1}`.
- Test fixtures inside `*.test.ts(x)`.

## React patterns

Target React 19.2 and Next 16. Write current React, not 2022 React.

### Components

- **Named function exports, never `export default`** in `src/components/` (`page.tsx`, `layout.tsx`, `error.tsx` and other App Router files must default export, as Next requires).
- **No `React.FC`.** Props are a local `interface` with `readonly` fields, destructured in the signature.
- **No `forwardRef`.** React 19 passes `ref` as an ordinary prop. Extend `ComponentPropsWithRef<"button">` when a component wraps an element. See [Button.tsx](src/components/Button.tsx).
- Compose `className` with `cx(...)` from [src/components/cx.ts](src/components/cx.ts).

### Server and client

- **Default to a Server Component.** Add `"use client"` only for state, effects, browser APIs, event handlers, framer-motion, or a `next/navigation` client hook.
- **Push the directive down to the smallest leaf.** A page stays a Server Component and hands the interactive part to one client child. [page.tsx](src/app/page.tsx) is static; [BoardClient.tsx](src/components/board/BoardClient.tsx) carries the directive and loads the board in the browser only, because everything on it lives in `localStorage`.
- `useSearchParams` in a client component opts the whole route out of static rendering unless it sits inside a `<Suspense>` boundary. Wrap it.
- `params` and `searchParams` are Promises in Next 16. Type them as `Promise<...>` and `await` them in the page and in `generateMetadata`.
- Where the slug set is known, pair `generateStaticParams()` with `export const dynamicParams = false` so an unknown slug is a real 404 rather than a cached 200.
- Metadata comes from the `metadata` export or `generateMetadata`, never a hand written `<head>`.

### Hooks and state

- **Do not reach for `useEffect`** to compute a derived value (compute it in render, `useMemo` only if measured), to read an external store (`useSyncExternalStore`, see [lib/hooks.ts](src/lib/hooks.ts)), or to reset state when a prop changes (change the `key`). `useEffect` is for subscriptions and real DOM side effects, always with a cleanup.
- Shared behaviour goes in [src/lib/hooks.ts](src/lib/hooks.ts) (`useEscapeKey`, `useScrollLock`, `usePrefersReducedMotion`, `useFocusTrap`), not copied into components.
- `useId` for anything tying a label to an input.
- The React Compiler is not enabled in [next.config.ts](next.config.ts). Do not scatter `useMemo` / `useCallback` / `memo`. Use them where they are load bearing: a context value, or a dependency of an effect. See [BoardProvider.tsx](src/components/board/BoardProvider.tsx).
- Cross-component state goes through a provider with a typed context and a `use*` accessor that throws outside the provider. One provider per concern. The board's state is one reducer in [src/lib/board/reducer.ts](src/lib/board/reducer.ts): pure, and every action is stamped with `now` so the clock never makes it impure.

### Data and forms

- There is no backend. The board is stored in the browser (`localStorage`) and moves between devices through an exported file. A form holding its result in local state is honest while no endpoint exists.
- **When an endpoint is wired, use a Server Function plus `useActionState`** (and `useOptimistic` where the UI should not wait), not a hand rolled `fetch` with a loading boolean.
- Async work in a Server Component is a plain `await` in the component body wrapped in `<Suspense>`. Do not fetch in a `useEffect`.

### Files, images, errors

- Images always through `next/image`, with a `sizes` value from `constants/config.ts`.
- Fonts through `next/font` in [layout.tsx](src/app/layout.tsx), exposed as CSS variables the SCSS reads.
- Use the App Router's own files rather than inventing equivalents: `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `opengraph-image.tsx`, [sitemap.ts](src/app/sitemap.ts), [robots.ts](src/app/robots.ts), [manifest.ts](src/app/manifest.ts).
- Pure logic goes in [src/lib/](src/lib/) (`board/queries`, `board/reducer`, `board/storage`, `board/sheet`, `board/names`), not in a component.

### TypeScript

- `strict` is on and stays on. No `any`, no non-null `!` to silence an error, no `as` cast that hides a real mismatch.
- Prefer `readonly` on props and array fields, and `as const` on data.
- Type data shapes once in the constants file and import the type. Do not restate a shape in the component.
- Infer return types for local helpers; annotate exported ones.

## Accessibility and motion

- Every interactive element is reachable and operable by keyboard. An overlay traps focus (`useFocusTrap`), closes on Escape (`useEscapeKey`), and locks the page behind it (`useScrollLock`).
- Icon-only controls carry an `aria-label` from a constant. Decorative SVG gets `aria-hidden="true"`.
- Hit targets are at least 44px. Use the `icon-hit-area` mixin rather than padding the layout apart.
- Honour `prefers-reduced-motion` in both layers: the CSS query and `usePrefersReducedMotion()` where a timer or animation runs in JS.
- Contrast pairings are set in `brand.md`. Do not invent a new text-on-surface combination without checking it there.

## Writing style: no long dashes

**Never use em-dashes (U+2014) or en-dashes (U+2013) in any file you write or edit.** Regular hyphens (`-`) are fine and encouraged.

This applies to user-facing copy, code comments, commit messages, PR descriptions and documentation.

- **Parenthetical break:** hyphen with spaces: `The trial is free - come along before you decide.`
- **Numeric or score range:** plain hyphen: `4-3-3`, `9-11 year olds`, `Sept-Aug`.
- **If in doubt:** rewrite so no dash is needed. Short sentences read more human than long ones stitched together.

**Exception:** character classes inside regexes that intentionally match either a hyphen or an en-dash when parsing third-party HTML. Those are defensive parsing, not prose.

Scan new or modified content for both characters before finishing an edit.

## Commit messages: no AI co-author trailer

**Never add `Co-Authored-By: Claude ...` or any AI attribution to commit messages, PR bodies, or any git metadata.** The user is the sole author on record.

- End the message body at the last meaningful line. No trailing blank line plus trailer.
- Same rule for `gh pr create --body`.
- Use a plain HEREDOC with only the subject and body, nothing after.

## Repo

- Default branch: `main`. Remote: https://github.com/davide77/squad-board. Hosted on Vercel at https://gafferboard.com.
- `npm run dev` to start the dev server, `npm run lint` before finishing a change that touches TS or TSX.
- After a non-trivial SCSS refactor, compile the stylesheet on its own to catch Sass errors before Next does. The command is in [the SCSS skill](.claude/skills/scss-utility-architecture/SKILL.md).
