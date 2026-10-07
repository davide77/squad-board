# Gafferboard

A matchday board for coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen that works on a phone. Live at https://gafferboard.com.

Everything is stored in the browser (`localStorage`). There is no backend and no account. A squad moves between devices through an exported file.

## Run it

```bash
npm install
npm run dev
```

`npm run build` for a production build. Before committing: `npm run lint`, `npm run typecheck` and `npm test`. CI runs them, the build and the Storybook build on every push and pull request.

`npm run storybook` opens the component library on port 6006. Every story is also a test: `npm test` renders each one in Chromium, runs its interactions and checks it with axe, so an accessibility violation fails the build. `npm run test:unit` runs only the board logic tests, in Node. Storybook needs Node 22.12 or later.

## Where things are

- `src/app/page.tsx` - the page, a Server Component that hands off to the board.
- `src/components/board/` - the board's UI. `BoardClient.tsx` loads it in the browser only.
- `src/lib/board/` - pure logic: the reducer, queries, storage, the team sheet.
- `src/constants/` - every string, number, formation and colour.
- `src/styles/` - the token driven Sass layer.

The brand is in [brand.md](brand.md).
