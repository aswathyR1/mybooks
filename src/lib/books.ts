import booksData from '../data/books.json'
import type { Book, Status } from '../types'

export const OWNER = 'Aswathy'
export const books = booksData as Book[]
export const readBooks = books.filter((b) => b.status === 'read')

// "2005-2020" → "2005–2020"
export const prettyGroup = (g: string) => g.replace('-', '–')
// Newest first; an era like "2005-2020" sorts by its end year.
const groupSortKey = (g: string) => Number(g.slice(-4)) || 0

export const byRecent = (a: Book, b: Book) =>
  (b.dateRead ?? '').localeCompare(a.dateRead ?? '') || b.dateAdded.localeCompare(a.dateAdded)

export const formatNum = (n: number) => n.toLocaleString('en-US')
export const sumPages = (list: Book[]) => list.reduce((s, b) => s + (b.pages ?? 0), 0)

export function avgRating(list: Book[]) {
  const rated = list.filter((b) => b.rating > 0)
  return rated.length ? rated.reduce((s, b) => s + b.rating, 0) / rated.length : null
}

// --- Library tabs: one per reading year/era, then the non-read shelves ---

export interface Tab {
  id: string // used in the URL: #/library/<id>
  label: string
  books: Book[]
}

const STATUS_TABS: { status: Exclude<Status, 'read'>; id: string; label: string }[] = [
  { status: 'reading', id: 'reading', label: 'Reading now' },
  { status: 'dnf', id: 'dnf', label: 'Did not finish' },
  { status: 'want', id: 'want', label: 'Want to read' },
]

export const yearGroups: string[] = [...new Set(readBooks.map((b) => b.group).filter((g): g is string => !!g))].sort(
  (a, b) => groupSortKey(b) - groupSortKey(a),
)

export const tabs: Tab[] = [
  ...yearGroups.map((g) => ({
    id: g,
    label: prettyGroup(g),
    books: readBooks.filter((b) => b.group === g).sort(byRecent),
  })),
  ...STATUS_TABS.map(({ status, id, label }) => ({
    id,
    label,
    books: books.filter((b) => b.status === status).sort(byRecent),
  })),
].filter((t) => t.books.length > 0)

export function matchesQuery(book: Book, q: string) {
  if (!q) return true
  const hay = `${book.title} ${book.author} ${book.series ?? ''}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word))
}

// --- Dashboard metrics ---

export interface AuthorStat {
  author: string
  books: Book[]
  pages: number
  rating: number | null
}

export const authorLeaderboard: AuthorStat[] = (() => {
  const map = new Map<string, Book[]>()
  for (const b of readBooks) map.set(b.author, [...(map.get(b.author) ?? []), b])
  return [...map.entries()]
    .map(([author, list]) => ({ author, books: list, pages: sumPages(list), rating: avgRating(list) }))
    .sort((a, b) => b.books.length - a.books.length || b.pages - a.pages)
})()

// "The Hunger Games #2" → "The Hunger Games"
export const seriesLeaderboard = (() => {
  const map = new Map<string, Book[]>()
  for (const b of readBooks) {
    if (!b.series) continue
    const name = b.series.replace(/\s*#.*$/, '').trim()
    map.set(name, [...(map.get(name) ?? []), b])
  }
  return [...map.entries()]
    .map(([series, list]) => ({ series, books: list }))
    .filter((s) => s.books.length > 1)
    .sort((a, b) => b.books.length - a.books.length)
})()

export const perYear = yearGroups.map((g) => {
  const list = readBooks.filter((b) => b.group === g)
  return { group: g, label: prettyGroup(g), count: list.length, pages: sumPages(list) }
})

// Ratings bucketed to whole stars (3.75 → 3★ bucket would undersell it, so round to nearest).
export const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
  label: `${stars}★`,
  count: readBooks.filter((b) => b.rating > 0 && Math.round(b.rating) === stars).length,
}))

const ERAS: { label: string; from: number; to: number }[] = [
  { label: 'Before 1850', from: -Infinity, to: 1849 },
  { label: '1850–1899', from: 1850, to: 1899 },
  { label: '1900–1949', from: 1900, to: 1949 },
  { label: '1950–1999', from: 1950, to: 1999 },
  { label: '2000–2009', from: 2000, to: 2009 },
  { label: '2010–2019', from: 2010, to: 2019 },
  { label: '2020 onwards', from: 2020, to: Infinity },
]

export const publishedEras = ERAS.map((e) => ({
  label: e.label,
  count: readBooks.filter((b) => b.published != null && b.published >= e.from && b.published <= e.to).length,
}))

const withPages = readBooks.filter((b) => b.pages)
const withYear = readBooks.filter((b) => b.published)
const pick = (list: Book[], cmp: (a: Book, b: Book) => number) => [...list].sort(cmp)[0] ?? null

export const highlights = {
  longest: pick(withPages, (a, b) => b.pages! - a.pages!),
  shortest: pick(withPages, (a, b) => a.pages! - b.pages!),
  oldest: pick(withYear, (a, b) => a.published! - b.published!),
  newest: pick(withYear, (a, b) => b.published! - a.published!),
}

export const favourites = readBooks.filter((b) => b.rating >= 5)

export const totals = {
  read: readBooks.length,
  pages: sumPages(readBooks),
  avgRating: avgRating(readBooks),
  avgLength: withPages.length ? Math.round(sumPages(withPages) / withPages.length) : 0,
  authors: authorLeaderboard.length,
  reading: books.filter((b) => b.status === 'reading').length,
  want: books.filter((b) => b.status === 'want').length,
  dnf: books.filter((b) => b.status === 'dnf').length,
}
