# Gafferboard brand

> This file is the **single source of truth** for the Gafferboard brand. SCSS tokens, components, copy, and assets all derive from it. If anywhere in the repo disagrees with this file, this file wins. Update here first, then reflect downstream.

## Positioning

> **Pick the team on the touchline, not on the back of a teamsheet.**
>
> A matchday board for grassroots coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen that works on a phone.

Name: **Gafferboard**, one word, capital G. Lives at gafferboard.com.

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
3. **Sentence case for UI and headings.** The product name is always written Gafferboard.
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

The mark is a G drawn the way a coach draws a run on a tactics board: one chalk stroke that sweeps round from the top right and turns in along the bar, stopping short of a disc in the kit colour. The disc is a player, placed where the coach wants them, at the centre of the board.

- **Concept.** The coach decides, the board shows it. The stroke is the plan, the disc is the pick. The small gap between the bar and the disc is deliberate: the player is placed on the line, not part of it.
- **Shapes.** A single round-capped stroke, the same weight all the way, like chalk or a marker pen. The disc is the same shape as a shirt on the pitch in the app. No ball, no whistle, no shield: every other football product already uses those.
- **Colours.** Chalk `#F6F6F3` stroke and a Yellow `#F2D106` disc on Board `#0A0A0A`. The disc is the only colour, just as the kit colour is the only colour on the board.
- **Wordmark.** "Gafferboard" in Saira Condensed Bold, converted to outlines. Cap height is 22/48 of the mark, so the G leads and the name follows.

Files in [public/brand/](public/brand/):

- `gafferboard-logo.svg` - mark and wordmark, for dark backgrounds. The default.
- `gafferboard-logo-mono.svg` - one colour, for light backgrounds and print.
- `gafferboard-mark.svg`, `gafferboard-mark-mono.svg` - the G on its own.
- `gafferboard-icon.svg` - the G on a Board rounded square: app icon and favicon.

Rules:

- Use the colour version on Board only. On any other background use the mono version, in Board or Chalk.
- Never recolour the disc to a club colour. The club's colour belongs to the board inside the app, not to the logo.
- Clear space: half the mark's height on every side. Minimum size: 16px for the mark, 96px wide for the full logo.
- The crest in the app header is the coach's own club initials, not the Gafferboard logo. Keep the two apart.

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
