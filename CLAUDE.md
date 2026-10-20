# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal reading site ("Aswathy's Bookshelf") built from a Goodreads library export. Vite + React 18 + TypeScript + Tailwind CSS v4, deployed to GitHub Pages at https://aswathyr1.github.io/mybooks/.

## Commands

```sh
npm run import                       # goodreads_library_export.csv → src/data/books.json (+ cover lookup)
npm run import -- path/to/export.csv # import a differently named export
npm run dev                          # local dev server
npm run build                        # tsc --noEmit, then vite build → dist/
npm run preview                      # serve dist/ locally
```

There is no test suite or linter; `npm run build` (type-check + build) is the verification step. Local Node is 18, so keep dependencies Node-18 compatible (e.g. Vite 6, not 7); CI uses Node 20.

## Data pipeline

Goodreads has no usable API, so data flows: Goodreads CSV export → `scripts/import-goodreads.mjs` → committed `src/data/books.json` → imported statically by the app. There is no runtime fetching of book data.

- The raw CSV is git-ignored (it contains private columns); only the cleaned `books.json` is committed. Never commit the CSV.
- The import script also resolves cover URLs from Open Library (ISBN first, then title/author search) and caches results in `scripts/.cover-cache.json` (git-ignored). Delete a book's entry there to force a re-lookup.
- **Reading year comes from the Goodreads *exclusive shelf*, not from "Date Read"** (the owner rarely fills that in). See `classify()` in the import script:
  - a shelf named like `2025` or `2005-2020` → that year/era (`group`)
  - `read` → year of Date Read if present, else `DEFAULT_READ_YEAR` (currently `2026`)
  - `currently-reading` / `to-read` / `did-not-finish` → status `reading` / `want` / `dnf`
  - Non-exclusive tags (e.g. a `2024` tag on a to-read book) are ignored.
- The `Book` type in `src/types.ts` mirrors the JSON shape; change both together.

## App architecture

- `src/lib/books.ts` is the single place where data is derived: tabs for the library, all dashboard metrics (author/series leaderboards, rating and publication-era distributions, highlights, totals), and shared helpers (`prettyGroup`, `matchesQuery`, `byRecent`). These are computed once at module load since the data is static. Pages should consume these rather than recomputing.
- Routing is a tiny hash router (`src/lib/router.ts`), deliberately used so deep links work on GitHub Pages without server rewrites. Routes: `#/` (Dashboard) and `#/library/<tabId>`, where `tabId` is a year group (`2025`, `2005-2020`) or `reading` / `dnf` / `want`. Build links with the `href` helpers.
- `src/pages/Dashboard.tsx`: metrics only. `src/pages/Library.tsx`: one tab (year) shown at a time with tabs, search, and prev/next — no infinite scroll.

## Styling conventions

- Dark-only theme. Colors are Tailwind v4 `@theme` tokens in `src/index.css` (`paper`, `paper-2`, `paper-3`, `ink`, `ink-soft`, `ink-muted`, `rule`, `accent`, `mark`); use these rather than raw colors.
- `mark` is the chart-bar color (validated for contrast/lightness on the dark panels); `accent` is for UI/text highlights. Text never uses the `mark` color.
- Fonts: Fraunces (serif) for titles/headings, Inter (sans) for body and all numbers/metrics.
- Charts are hand-built (`BarList`, leaderboard table), no chart library: single series, bars ≤24px with a rounded data end, value at the tip, hover/focus tooltip.
- Grid/flex children that contain wide content (e.g. the leaderboard table) need `min-w-0`, or they overflow on mobile.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with `BASE_PATH=/<repo-name>/` (read by `vite.config.ts` as Vite's `base`) and publishes to GitHub Pages. The `gh` CLI is installed at `~/.local/bin/gh` (not via Homebrew).
