import type { Book } from '../types'
import {
  authorLeaderboard,
  favourites,
  formatNum,
  highlights,
  perYear,
  publishedEras,
  ratingDistribution,
  seriesLeaderboard,
  totals,
  yearGroups,
} from '../lib/books'
import { href } from '../lib/router'
import { BarList } from '../components/BarList'
import { Panel, StatTile } from '../components/Panel'
import { Cover } from '../components/BookCard'
import { Stars } from '../components/Stars'

const goodreads = (b: Book) => `https://www.goodreads.com/book/show/${b.id}`

function MiniCover({ book, className = 'w-8' }: { book: Book; className?: string }) {
  return (
    <a href={goodreads(book)} target="_blank" rel="noreferrer" title={`${book.title} — ${book.author}`} className={`block shrink-0 ${className}`}>
      <div className="aspect-[2/3] overflow-hidden rounded-[3px] ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-accent">
        <Cover book={book} small />
      </div>
    </a>
  )
}

function AuthorLeaderboard() {
  const top = authorLeaderboard.slice(0, 10)
  const max = top[0]?.books.length ?? 1
  return (
    <Panel title="Author leaderboard" subtitle={`Top 10 of ${totals.authors} authors, by books read`} className="lg:col-span-2">
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-muted">
              <th className="w-10 px-2 pb-2 font-normal">#</th>
              <th className="px-2 pb-2 font-normal">Author</th>
              <th className="w-40 px-2 pb-2 font-normal">Books</th>
              <th className="px-2 pb-2 text-right font-normal">Pages</th>
              <th className="px-2 pb-2 text-right font-normal">Avg rating</th>
            </tr>
          </thead>
          <tbody>
            {top.map((a, i) => (
              <tr key={a.author} className="border-t border-rule align-middle hover:bg-paper-3">
                <td className="px-2 py-3 font-serif text-lg text-ink-muted tabular-nums">{i + 1}</td>
                <td className="px-2 py-3">
                  <p className="font-medium">{a.author}</p>
                  <div className="mt-2 flex gap-1.5">
                    {a.books.slice(0, 8).map((b) => (
                      <MiniCover key={b.id} book={b} className="w-7" />
                    ))}
                    {a.books.length > 8 && <span className="self-center text-xs text-ink-muted">+{a.books.length - 8}</span>}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 rounded-r-[4px] bg-mark" style={{ width: `${(a.books.length / max) * 6.5}rem` }} />
                    <span className="tabular-nums text-ink-soft">{a.books.length}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-right tabular-nums text-ink-soft">{formatNum(a.pages)}</td>
                <td className="px-2 py-3 text-right">
                  {a.rating ? <Stars rating={a.rating} /> : <span className="text-ink-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function Highlight({ label, book, fact }: { label: string; book: Book | null; fact: string }) {
  if (!book) return null
  return (
    <div className="flex gap-4 rounded-xl bg-paper-3/50 p-3">
      <MiniCover book={book} className="w-14" />
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="mt-0.5 line-clamp-2 font-serif leading-snug font-semibold">{book.title}</p>
        <p className="truncate text-xs text-ink-soft">{book.author}</p>
        <p className="mt-1 text-xs font-medium text-accent">{fact}</p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const eras = yearGroups.length
  return (
    <div className="space-y-6 pb-20">
      {/* Hero */}
      <section className="pt-6 sm:pt-10">
        <p className="text-sm text-ink-soft">Books read</p>
        <p className="text-6xl font-semibold tracking-tight sm:text-7xl">{formatNum(totals.read)}</p>
        <p className="mt-3 max-w-2xl text-ink-soft">
          {formatNum(totals.pages)} pages by {totals.authors} authors, across {eras} reading {eras === 1 ? 'period' : 'periods'}.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Pages turned" value={formatNum(totals.pages)} />
        <StatTile label="Avg rating" value={totals.avgRating ? `${totals.avgRating.toFixed(1)} ★` : '—'} note={`${ratingDistribution.reduce((s, r) => s + r.count, 0)} rated`} />
        <StatTile label="Avg length" value={formatNum(totals.avgLength)} note="pages per book" />
        <StatTile label="Authors" value={String(totals.authors)} />
        <StatTile label="Reading now" value={String(totals.reading)} />
        <StatTile label="Want to read" value={String(totals.want)} note={`${totals.dnf} did not finish`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Books per year" subtitle="Click a year to see its books">
          <BarList
            unit="books"
            items={perYear.map((y) => ({
              key: y.group,
              label: y.label,
              value: y.count,
              detail: `${formatNum(y.pages)} pages`,
              href: href.library(y.group),
            }))}
          />
        </Panel>

        <Panel title="How I rated them" subtitle="Rounded to the nearest star · unrated books left out">
          <BarList unit="books" labelWidth="3rem" items={ratingDistribution.map((r) => ({ key: r.label, label: r.label, value: r.count }))} />
        </Panel>

        <AuthorLeaderboard />

        <Panel title="When they were written" subtitle="By original publication year">
          <BarList unit="books" labelWidth="7.5rem" items={publishedEras.map((e) => ({ key: e.label, label: e.label, value: e.count }))} />
        </Panel>

        <Panel title="Series I've binged" subtitle="Series with two or more books read">
          <ul className="space-y-3">
            {seriesLeaderboard.slice(0, 7).map((s) => (
              <li key={s.series} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.series}</p>
                  <p className="truncate text-xs text-ink-muted">{s.books[0].author}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {s.books.slice(0, 7).map((b) => (
                    <MiniCover key={b.id} book={b} className="w-6" />
                  ))}
                  <span className="ml-1.5 w-5 text-right text-sm tabular-nums text-ink-soft">{s.books.length}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Highlights" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Highlight label="Longest read" book={highlights.longest} fact={`${formatNum(highlights.longest?.pages ?? 0)} pages`} />
            <Highlight label="Shortest read" book={highlights.shortest} fact={`${highlights.shortest?.pages} pages`} />
            <Highlight label="Oldest classic" book={highlights.oldest} fact={`Written ${formatYear(highlights.oldest?.published)}`} />
            <Highlight label="Newest release" book={highlights.newest} fact={`Published ${highlights.newest?.published}`} />
          </div>
        </Panel>

        {favourites.length > 0 && (
          <Panel title="Five-star favourites" subtitle={`${favourites.length} books rated 5★`} className="lg:col-span-2">
            <div className="flex flex-wrap gap-3">
              {favourites.map((b) => (
                <MiniCover key={b.id} book={b} className="w-20" />
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}

const formatYear = (y?: number | null) => (y == null ? '?' : y < 0 ? `${-y} BC` : String(y))
