import { useMemo, useState } from 'react'
import booksData from './data/books.json'
import type { Book, Status } from './types'
import { BookCard } from './components/BookCard'

const books = booksData as Book[]
const OWNER = 'Aswathy'

interface Section {
  id: string
  label: string
  sublabel?: string
  books: Book[]
}

const STATUS_SECTIONS: { status: Exclude<Status, 'read'>; label: string; sublabel: string }[] = [
  { status: 'reading', label: 'Reading now', sublabel: 'On the nightstand' },
  { status: 'dnf', label: 'Did not finish', sublabel: 'Maybe another time' },
  { status: 'want', label: 'Want to read', sublabel: 'The ever-growing pile' },
]

// "2005-2020" → "2005–2020"
const prettyGroup = (g: string) => g.replace('-', '–')
// Newest first; an era like "2005-2020" sorts by its end year.
const groupSortKey = (g: string) => Number(g.slice(-4)) || 0

const byRecent = (a: Book, b: Book) =>
  (b.dateRead ?? '').localeCompare(a.dateRead ?? '') || b.dateAdded.localeCompare(a.dateAdded)

const formatNum = (n: number) => n.toLocaleString('en-US')

function matches(book: Book, q: string) {
  if (!q) return true
  const hay = `${book.title} ${book.author} ${book.series ?? ''}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word))
}

export default function App() {
  const [query, setQuery] = useState('')

  const read = books.filter((b) => b.status === 'read')
  const rated = read.filter((b) => b.rating > 0)
  const stats = [
    { label: 'Books read', value: formatNum(read.length) },
    { label: 'Pages turned', value: formatNum(read.reduce((s, b) => s + (b.pages ?? 0), 0)) },
    { label: 'Avg. rating', value: rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) + ' ★' : '—' },
    { label: 'Reading now', value: String(books.filter((b) => b.status === 'reading').length) },
  ]

  const sections: Section[] = useMemo(() => {
    const filtered = books.filter((b) => matches(b, query.trim()))
    const groups = new Map<string, Book[]>()
    for (const b of filtered) {
      if (b.status !== 'read' || !b.group) continue
      groups.set(b.group, [...(groups.get(b.group) ?? []), b])
    }
    const yearSections = [...groups.entries()]
      .sort(([a], [b]) => groupSortKey(b) - groupSortKey(a))
      .map(([group, list]) => ({
        id: `y${group}`,
        label: prettyGroup(group),
        sublabel: `${list.length} ${list.length === 1 ? 'book' : 'books'} · ${formatNum(list.reduce((s, b) => s + (b.pages ?? 0), 0))} pages`,
        books: [...list].sort(byRecent),
      }))
    const statusSections = STATUS_SECTIONS.map(({ status, label, sublabel }) => ({
      id: status,
      label,
      sublabel,
      books: filtered.filter((b) => b.status === status).sort(byRecent),
    }))
    return [...yearSections, ...statusSections].filter((s) => s.books.length > 0)
  }, [query])

  // Books-per-year chart uses the unfiltered data so it doesn't jump while searching.
  const perYear = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of read) if (b.group) counts.set(b.group, (counts.get(b.group) ?? 0) + 1)
    return [...counts.entries()].sort(([a], [b]) => groupSortKey(b) - groupSortKey(a))
  }, [read])
  const maxPerYear = Math.max(...perYear.map(([, n]) => n))

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <header className="pt-14 pb-10 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">A reading life</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight font-bold sm:text-6xl">
          {OWNER}'s Bookshelf
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft sm:text-lg">
          Every book I've read, year by year — from childhood favourites to what's on my nightstand today.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-rule ring-1 ring-rule">
            {stats.map((s) => (
              <div key={s.label} className="bg-paper px-5 py-4">
                <dt className="text-xs text-ink-soft">{s.label}</dt>
                <dd className="mt-1 font-serif text-3xl font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-xl bg-paper-2/60 p-5 ring-1 ring-rule">
            <p className="text-xs text-ink-soft">Books per year</p>
            <ul className="mt-3 space-y-2.5">
              {perYear.map(([group, n]) => (
                <li key={group}>
                  <a href={`#y${group}`} className="group grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm">
                    <span className="font-medium group-hover:text-accent">{prettyGroup(group)}</span>
                    <span className="h-2.5 rounded-full bg-rule">
                      <span
                        className="block h-full rounded-full bg-accent transition-all"
                        style={{ width: `${(n / maxPerYear) * 100}%` }}
                      />
                    </span>
                    <span className="text-right tabular-nums text-ink-soft">{n}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Sticky nav + search */}
      <nav className="sticky top-0 z-10 -mx-4 border-y border-rule bg-paper/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 rounded-full px-3 py-1 text-sm text-ink-soft ring-1 ring-rule transition hover:bg-ink hover:text-paper"
              >
                {s.label}
              </a>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, series…"
            className="w-full rounded-full bg-paper-2 px-4 py-1.5 text-sm ring-1 ring-rule outline-none placeholder:text-ink-soft/70 focus:ring-2 focus:ring-accent sm:w-64"
          />
        </div>
      </nav>

      <main className="pb-24">
        {sections.length === 0 && (
          <p className="py-24 text-center text-ink-soft">No books match “{query}”.</p>
        )}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="border-b border-rule py-12 last:border-0">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl font-bold sm:text-4xl">{s.label}</h2>
              <p className="text-sm text-ink-soft">{s.sublabel}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {s.books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-rule py-8 text-center text-xs text-ink-soft">
        Data from Goodreads · Covers from Open Library
      </footer>
    </div>
  )
}
