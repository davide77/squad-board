---
name: brand-guidelines
description: Applies the {{PROJECT_NAME}} brand identity (colours, typography, logo rules, pattern system, photography direction) to any artifact produced for this project - slides, posters, social posts, docs, or web pages. Use whenever brand colours, typography, or visual formatting apply. Defers to brand.md as the single source of truth.
---

# {{PROJECT_NAME}} brand styling

## Source of truth

The canonical brand definition for this project lives at **[brand.md](../../../brand.md)** at the repo root. Always read that file first. It is kept in sync with the SCSS tokens in [src/styles/abstracts/](../../../src/styles/abstracts/).

If this SKILL.md and `brand.md` ever disagree, `brand.md` wins. Update `brand.md` first, then reflect the change here.

**Keywords:** {{PROJECT_NAME}}, branding, visual identity, brand colours, typography, logo, pattern, photography direction, brand voice, design system

## When to use this skill

Trigger this skill whenever you are:

- Producing any visual artifact for {{PROJECT_NAME}} (slide deck, poster, social image, PDF, web page, email, social post).
- Applying colours, typography, or layout decisions that need to be on-brand.
- Reviewing an artifact for brand consistency.
- Generating images, diagrams, or mockups that will be shown to a real audience.

## Brand summary

Read [brand.md](../../../brand.md) for the full positioning, mood, voice, palette, type system, logo rules, pattern rules, and photography direction. The summary below is a fast reference, not a substitute.

### Colours (mirror exactly)

Pull from [brand.md](../../../brand.md). Map keys live in [src/styles/abstracts/_colors.scss](../../../src/styles/abstracts/_colors.scss). Do not hard-code hex values in component SCSS, always go through `color($name)`.

### Typography

Headline / body / accent stacks defined in [brand.md](../../../brand.md) and mirrored in [src/styles/abstracts/_typography.scss](../../../src/styles/abstracts/_typography.scss). Loaded via `next/font/google` (or equivalent) in [src/app/layout.tsx](../../../src/app/layout.tsx) and exposed as CSS variables.

### Logo

See [brand.md](../../../brand.md) for the rules: minimum size, clear space, lock-up rules, allowed colours. Never distort, rotate, outline, gradient, shadow, or recolour.

### Pattern and motifs

Defer to [brand.md](../../../brand.md). Build from the brand-defined motifs only, never invent decorative shapes outside the system.

### Photography direction

Defer to [brand.md](../../../brand.md). One paragraph for social, one for web/institutional, one for profiles/interviews.

## Voice rules that intersect with visual work

When placing copy on visuals:

- No em-dashes (`—`) or en-dashes (`–`). Use plain hyphens. Enforced project-wide by [CLAUDE.md](../../../CLAUDE.md).
- One core message at a time.
- Legibility first, style second. No coloured text over photos unless fully legible.
- For copy tone, defer to the `brand-voice` skill and to [brand.md](../../../brand.md).

## Applying this skill in common tools

When generating artifacts in other skills (`pptx`, `docx`, `pdf`, `canvas-design`, `frontend-design`, `banana`, `seo-image-gen`, `theme-factory`, etc.), pass these values through:

- Heading colour: from the primary palette in [brand.md](../../../brand.md).
- Body colour: ink/black from the primary palette on light, white on dark.
- Primary accent: from the primary palette in [brand.md](../../../brand.md).
- Highlight accent: from the accent palette, used sparingly (one word or small area).
- Headline font: from the typography section in [brand.md](../../../brand.md).
- Body font: from the typography section in [brand.md](../../../brand.md).

For web components, always prefer the utility classes and SCSS tokens already defined - do not hard-code hex values in new components. See [CLAUDE.md](../../../CLAUDE.md) "Styling: the decision ladder".
