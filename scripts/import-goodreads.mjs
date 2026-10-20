// Converts a Goodreads library export (CSV) into src/data/books.json for the app.
//
// Usage:  npm run import                       (reads goodreads_library_export.csv)
//         npm run import -- path/to/export.csv
//
// Goodreads: My Books → Import and export → Export Library.

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const CSV_PATH = process.argv[2] ?? 'goodreads_library_export.csv'
const OUT_PATH = 'src/data/books.json'
const CACHE_PATH = 'scripts/.cover-cache.json'

// Books on the plain "read" shelf with no "Date Read" are counted in this year.
const DEFAULT_READ_YEAR = '2026'

// Shelves that aren't years. Any shelf that looks like "2025" or "2005-2020" is a year group.
const STATUS_SHELVES = {
  'currently-reading': 'reading',
  'to-read': 'want',
  'did-not-finish': 'dnf',
}

// --- CSV parsing (handles quoted fields, escaped quotes and newlines inside quotes) ---
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [header, ...body] = rows.filter((r) => r.some(Boolean))
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
}

// Goodreads wraps ISBNs as ="9780141439556" so spreadsheets keep leading zeros.
const cleanIsbn = (v) => v.replace(/[="]/g, '').trim()

// "Mockingjay (The Hunger Games, #3)" → { title: "Mockingjay", series: "The Hunger Games #3" }
function splitTitle(raw) {
  const m = raw.match(/^(.*?)\s*\(([^()]*#[^()]*)\)\s*$/)
  if (!m) return { title: raw.trim(), series: null }
  return { title: m[1].trim(), series: m[2].replace(/,\s*#/, ' #').trim() }
}

function classify(row) {
  const shelf = row['Exclusive Shelf']
  const dateRead = row['Date Read'] ? row['Date Read'].replaceAll('/', '-') : null
  if (STATUS_SHELVES[shelf]) return { status: STATUS_SHELVES[shelf], group: null, dateRead }
  if (/^\d{4}(-\d{4})?$/.test(shelf)) return { status: 'read', group: shelf, dateRead }
  if (shelf === 'read') return { status: 'read', group: dateRead?.slice(0, 4) ?? DEFAULT_READ_YEAR, dateRead }
  console.warn(`  ! Unknown shelf "${shelf}" for "${row.Title}" — treating as read, no year`)
  return { status: 'read', group: 'Undated', dateRead }
}

// --- Covers from Open Library (cached so re-imports are fast) ---
const cache = existsSync(CACHE_PATH) ? JSON.parse(await readFile(CACHE_PATH, 'utf8')) : {}

async function findCover(book) {
  if (book.id in cache) return cache[book.id]
  let url = null
  if (book.isbn) {
    const candidate = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
    const res = await fetch(`${candidate}?default=false`, { method: 'HEAD' }).catch(() => null)
    if (res?.ok) url = candidate
  }
  if (!url) {
    const q = new URLSearchParams({ title: book.title, author: book.author, limit: '1', fields: 'cover_i' })
    const res = await fetch(`https://openlibrary.org/search.json?${q}`).catch(() => null)
    const coverId = res?.ok ? (await res.json()).docs?.[0]?.cover_i : null
    if (coverId) url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
  }
  cache[book.id] = url
  return url
}

async function mapLimit(items, limit, fn) {
  let next = 0
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < items.length) await fn(items[next++])
  }))
}

// --- Main ---
const rows = parseCsv(await readFile(CSV_PATH, 'utf8'))
console.log(`Read ${rows.length} books from ${CSV_PATH}`)

const books = rows.map((r) => ({
  id: r['Book Id'],
  ...splitTitle(r.Title),
  author: r.Author,
  rating: Number(r['My Rating']) || 0,
  pages: Number(r['Number of Pages']) || null,
  published: Number(r['Original Publication Year'] || r['Year Published']) || null,
  dateAdded: r['Date Added'].replaceAll('/', '-'),
  ...classify(r),
  review: r['My Review'].trim() || null,
  isbn: cleanIsbn(r.ISBN13) || cleanIsbn(r.ISBN) || null,
  cover: null,
}))

let done = 0
await mapLimit(books, 8, async (b) => {
  b.cover = await findCover(b)
  if (++done % 25 === 0) console.log(`  covers: ${done}/${books.length}`)
})
await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2))

for (const b of books) delete b.isbn
await writeFile(OUT_PATH, JSON.stringify(books, null, 2) + '\n')

const counts = books.reduce((acc, b) => ((acc[b.group ?? b.status] = (acc[b.group ?? b.status] ?? 0) + 1), acc), {})
console.log(`Wrote ${OUT_PATH}`, counts)
console.log(`Covers found: ${books.filter((b) => b.cover).length}/${books.length}`)
