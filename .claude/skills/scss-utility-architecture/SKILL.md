---
name: scss-utility-architecture
description: Token-driven SCSS architecture for this project. Token maps + accessor functions, generated utility classes, BEM component files, container-query-first responsive behaviour. Defers to brand.md for colour / type values.
allowed-tools: Read, Glob, Grep, Edit, Write
---

# {{PROJECT_NAME}} SCSS architecture

Project-level override of the generic skill. Use this as the conventions document whenever you add or change styles.

## Source of truth

- **Brand values** - [brand.md](../../../brand.md) at the repo root. Hex values, font stacks, logo rules. Mirror here, never invent.
- **Writing/voice rules** - [CLAUDE.md](../../../CLAUDE.md) (utility classes over component SCSS, no em-dashes, language variant).

## Directory layout

```
src/styles/
  abstracts/        # Maps, functions, mixins. NO CSS output.
    _breakpoints.scss   bp() viewport breakpoint map
    _colors.scss        $theme-colors map + color() + .bg-*/.is-*/.has-border-* utilities
    _typography.scss    $font-sizes, $font-weights, $line-heights + accessors, font stacks
    _spacers.scss       $spacers scale + spacer()
    _variables.scss     $radius-*, $transition-*, $focus-ring-*, $z-index
    _mixins.scss        min/max (media), focus-ring, flex-center
    _index.scss         @forward the above
  base/             # Element-level resets and defaults
    _reset.scss _base.scss _headings.scss _measures.scss
  layout/           # Page-level primitives (.container)
  utilities/        # Generated utility classes (@each-driven)
    _flex.scss _display.scss _radius.scss _sr-only.scss
  components/       # BEM component files, one per component
    _index.scss
  main.scss         # Entry - @use abstracts, base, layout, utilities, components (in order)
```

**Invariant:** `abstracts/` emits zero CSS. Only maps, functions, mixins. If a file in `abstracts/` outputs rules, move them to `base/` or a utility.

## Token maps and accessors

All values go through functions so typos become errors, not silent mistakes.

| Token | Map file | Accessor | Example |
| --- | --- | --- | --- |
| Colour | `_colors.scss` | `color($name)` | `color(green)` |
| Spacer | `_spacers.scss` | `spacer($n)` | `spacer(3)` |
| Font size | `_typography.scss` | `font-size($name)` | `font-size(xl)` |
| Font weight | `_typography.scss` | `font-weight($name)` | `font-weight(semibold)` |
| Line height | `_typography.scss` | `line-height($name)` | `line-height(tight)` |
| Viewport breakpoint | `_breakpoints.scss` | `bp($name)` | `bp(md)` |
| Z-index layer | `_variables.scss` | `z($layer)` | `z(sticky)` |

**When you need a new token value**, add it to the map first, do not hardcode. If a design calls for a value outside the scale (e.g. `gap: 12px`), either pick the nearest token or extend the map with a named step. Never drop a raw pixel.

## Utility class generation

Utilities are generated from maps with `@each` loops. Source of each pattern:

- **Colour utilities** - `_colors.scss` emits `.bg-<name>`, `.is-<name>`, `.has-border-<name>` for every key in `$theme-colors`.
- **Spacing** - `base/_measures.scss` emits `.has-m{side}-{n}`, `.has-p{side}-{n}` (with responsive `sm`/`md`/`lg` variants).
- **Gap / typography** - `base/_base.scss` emits `.has-gap-{n}`, `.text-<size>`, `.has-font-<weight>`, `.leading-<name>`, `.text-{left,center,right,justify}`, `.uppercase`, `.lowercase`, `.capitalize`.
- **Flex** - `utilities/_flex.scss` emits `.is-flex`, `.is-flex-column`, `.is-justify-*`, `.is-align-*`, `.is-flex-1`, plus responsive variants.
- **Display** - `utilities/_display.scss` emits `.is-block`, `.is-grid`, `.is-hidden`, plus responsive variants.
- **Radius** - `utilities/_radius.scss` emits `.has-radius-<name>`.

**Adding a new utility family:**

1. Add its map or scale.
2. Create a new file under `utilities/` that `@each`-loops the map.
3. Register with `@forward '<name>'` in [utilities/_index.scss](../../../src/styles/utilities/_index.scss).

## BEM component conventions

**A component does not get a sibling `.module.scss`. New ones are never written.** A component is styled by utility classes in its JSX. See "Never write a new `.module.scss`" in [CLAUDE.md](../../../CLAUDE.md).

What a class genuinely cannot express goes in a global file in `src/styles/components/` instead: `@keyframes`, pseudo-elements, container queries, per-instance `var()` custom properties, and composed chrome internals (button, form, modal, topbar).

- File name = kebab-case of the component (`_article-card.scss`).
- Register with `@forward '<name>'` in [components/_index.scss](../../../src/styles/components/_index.scss). Order matters for cascade: keep chrome first (topbar, footer), then cross-cutting, then page-specific.
- Classes use BEM, with `__` for elements and `--` for modifiers.
- Even here, **anything layout/spacing/typography that a utility class covers belongs in JSX**, not in the file. Reach for a global component file only after steps 1 and 2 of the decision ladder in [CLAUDE.md](../../../CLAUDE.md) have both failed.
- The kit still ships `src/components/Button.module.scss`. It predates this rule. Migrate it to `_button.scss` here on first use and do not copy its pattern.

Example global component file (`src/styles/components/_article-card.scss`):

```scss
@use '../abstracts' as *;

.article-card {
  background-color: color(white);
  border: 1px solid color(border);
  border-radius: $radius-card;

  &__title {
    font-family: $font-family-headline;
    line-height: line-height(tight);
  }

  &--inverse {
    background-color: color(black);
    color: color(cream);
  }
}
```

## Container-query-first responsive behaviour

**Reusable components (cards, tiles, rails) should respond to their own container width, not the viewport.** Page chrome (topbar, footer) still uses viewport media queries because it genuinely lives at viewport scale.

| Situation | Use |
| --- | --- |
| Reusable component responding to its own size | `@container (min-width: ...) { ... }` |
| Fluid typography inside a component | `cqi` units in `clamp()` |
| Page-level chrome (topbar, footer, section padding) | `@include min(bp(md))`, `@include max(...)` |

- Always name containers (`container-name: card`). Unnamed containers risk accidentally matching a great-grandparent.
- Always clamp `cqi`: `clamp(font-size(md), 6cqi, font-size(2xl))`. Floor and ceiling stop extremes from breaking the layout.
- Mobile-first with container queries too. Default styles assume the narrowest sensible width, then scale up.

## Do

- Add new colours, sizes, radii, breakpoints to their maps first, then reference via the accessor.
- Use `cqi` for fluid typography inside components.
- Run `npx --no-install sass --no-source-map src/styles/main.scss /tmp/check.css` after non-trivial refactors to catch Sass errors the TSX compiler cannot.

## Do not

- Hardcode hex values in component SCSS. If it is not in `$theme-colors`, it should not be in a rule.
- Hardcode spacing in px. Use `spacer(n)`. If the scale does not fit, extend the map.
- Put layout/spacing/typography that a utility already covers into component SCSS. The utility exists, use it in JSX.
- Reach for `vw`/`vh` inside a reusable component. Use `cqi`/`cqb`.
- Drop em-dashes (`—`) or en-dashes (`–`) into SCSS comments. Plain hyphens only.
