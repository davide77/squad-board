# Gafferboard

A matchday board for coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen that works on a phone. Live at https://gafferboard.com.

Everything is stored in the browser (`localStorage`). There is no backend and no account. A squad moves between devices through an exported file.

## Run it

```bash
npm install
npm run dev
```

`npm run build` for a production build, `npm run lint` before committing.

## Where things are

- `src/app/page.tsx` - the page, a Server Component that hands off to the board.
- `src/components/board/` - the board's UI. `BoardClient.tsx` loads it in the browser only.
- `src/lib/board/` - pure logic: the reducer, queries, storage, the team sheet.
- `src/constants/` - every string, number, formation and colour.
- `src/styles/` - the token driven Sass layer.

Conventions are in [CLAUDE.md](CLAUDE.md). The brand is in [brand.md](brand.md).
