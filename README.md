# 📚 Aswathy's Bookshelf

Every book I've read, built from my Goodreads library.

- **Dashboard** (`#/`): books read, pages, ratings, author leaderboard, series, highlights.
- **Library** (`#/library/<year>`): one page per reading year, with tabs, search and previous/next.

Built with Vite + React + TypeScript + Tailwind CSS, deployed to GitHub Pages.

## Updating the books

1. On Goodreads: **My Books → Import and export → Export Library**, download the CSV.
2. Save it in this folder as `goodreads_library_export.csv`.
3. Run:
   ```sh
   npm run import     # CSV → src/data/books.json (+ cover lookup)
   git add src/data/books.json
   git commit -m "Update books"
   git push           # GitHub Actions rebuilds and redeploys the site
   ```

The raw CSV is git-ignored; only the cleaned `books.json` is committed.

### How years are decided

Each book's **exclusive shelf** in Goodreads decides where it shows up:

| Shelf | Shows as |
|---|---|
| `2025`, `2005-2020`, … (any year or year range) | that year / era |
| `read` | year of "Date read", or `DEFAULT_READ_YEAR` in `scripts/import-goodreads.mjs` |
| `currently-reading` | Reading now |
| `did-not-finish` | Did not finish |
| `to-read` | Want to read |

## Local development

```sh
npm install
npm run dev
```
