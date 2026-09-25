# Squad board brand

> This file is the **single source of truth** for the Squad board brand. SCSS tokens, components, copy, and assets all derive from it. If anywhere in the repo disagrees with this file, this file wins. Update here first, then reflect downstream.

## Positioning

> **Pick the team on the touchline, not on the back of a teamsheet.**
>
> A matchday board for grassroots coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen that works on a phone.

Tagline (lock-up): **"Squad board"**

## Mood

Chalkboard, floodlit, practical, calm under pressure. Not glossy, not gamified, not a fantasy football app.

## Audience

- Grassroots and youth coaches picking a side every week.
- Assistant coaches and team managers running the subs on matchday.
- Club secretaries who need the team sheet in a message.

## Voice

### Voice in one paragraph

A coach talking to a coach. Short sentences, plain football words, no jargon the parents would not know. Every line tells you what to do next or what just happened. Instructions are direct ("Tick who is called up this week"), confirmations are one line ("Line-up saved").

### We sound like

- The assistant with the clipboard who already knows the plan.
- A clear instruction shouted across a pitch.
- Someone who respects that you are busy on a Saturday morning.

### We do not sound like

- A software onboarding tour.
- A betting or fantasy football app.
- A pundit.

### Hard rules

1. **No em-dashes or en-dashes anywhere.** Use plain hyphens with spaces around them. This is enforced project-wide by [CLAUDE.md](CLAUDE.md).
2. **British English only.** Colour, organise, centre, defence.
3. **Sentence case for UI and headings.** Title Case only for the product name.
4. **One core message at a time.**
5. **Filler ban list:** revolutionise, game-changer, synergy, unleash, elevate, leverage, cutting-edge, robust, seamless, intuitive, empower, world-class.
6. **Players are never gendered.** Squads can be boys, girls or mixed. Use the player's name or "they".

### Do say

- "Tick who is called up this week."
- "Strongest XI, with 2 changes."
- "Nobody else is available."

### Do not say

- "Oops! Something went wrong."
- "Unleash your squad's potential."
- "Call him up."

## Colours

All HEX values are canonical. Mirror them exactly in [src/styles/abstracts/_colors.scss](src/styles/abstracts/_colors.scss).

### Primary (dominant)

- **Board** `#0A0A0A` - page background.
- **Board 2** `#141414` - raised surfaces: buttons, chips, fields, the picker.
- **Board 3** `#1F1F1E` - hover on raised surfaces.
- **Chalk** `#F6F6F3` - body text and the goalkeeper's shirt.

### Secondary (complementary, smaller scale)

- **Dim** `#96968F` - secondary text, counts.
- **Dimmer** `#67675F` - hints, placeholders, quiet labels.

### Kit (club colour, chosen by the coach)

The kit colour is picked on the board and replaces the default at runtime. Each option carries its own ink so a shirt number stays readable on it. The list lives in `src/constants/brand.ts`.

- **Yellow (default)** `#F2D106`, ink `#0A0A0A`, edge `#C7AB08`.
- Red `#D93A2B`, Blue `#2E6BD9`, Green `#1FA463`, Sky `#59B6E8`, Claret `#8A2B4A`, Orange `#E8811F`, White `#ECECE8`.

### Accents (subtle, never on logo)

- **Out** `#E0766A` - injuries, clashing shirt numbers, a player out of position.

### Rules

- Dominant: Board, Chalk. Support: Dim, Dimmer. Accent only: Out.
- The kit colour marks what is yours: headings, the XI, the bench, primary actions.
- No colours outside this palette.

## Typography

- **Saira Condensed** - headings, shirt numbers, labels, the clock. Semibold or bold, slight letter spacing.
- **Barlow** - body copy, names, buttons.

Fallbacks: Saira Condensed -> Barlow -> system sans. Barlow -> system sans.

## Logo

- No logo. The crest is the coach's own club initials in the kit colour.

## Design direction

- A dark board, like a tactics board under floodlights.
- Tap targets that work with cold hands on a phone.
- Avoid: gradients beyond the pitch surface, shadows for decoration, illustration.

## Writing patterns

### Headings

- Saira Condensed, sentence case, one or two words ("Shape", "Bench", "Saved line-ups").

### CTAs

- Verb-led. Two or three words. Specific.
- Good: "Save line-up", "Copy team sheet", "Back to strongest XI".
- Bad: "Learn more", "Click here", "Submit".

### Error and empty states

- Human. Direct. No apology theatre.
- Good: "Nobody else is available."
- Bad: "Oops! Something went wrong. Please try again later."
