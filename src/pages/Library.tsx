import { useState } from 'react'
import { formatNum, matchesQuery, sumPages, tabs } from '../lib/books'
import { href } from '../lib/router'
import { BookCard } from '../components/BookCard'

export function Library({ tabId }: { tabId: string | null }) {
  const [query, setQuery] = useState('')
  const q = query.trim()

  const index = Math.max(0, tabs.findIndex((t) => t.id === tabId))
  const tab = tabs[index]
  const prev = tabs[index - 1]
  const next = tabs[index + 1]

  const visible = tab.books.filter((b) => matchesQuery(b, q))
  const isYear = /^\d/.test(tab.id)

  return (
    <div className="pb-20">
      {/* Year tabs + search */}
      <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 -mx-4 border-b border-rule bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Reading years" className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {tabs.map((t) => {
              const active = t.id === tab.id
              const count = q ? t.books.filter((b) => matchesQuery(b, q)).length : t.books.length
              return (
                <a
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  href={href.library(t.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition ${
                    active ? 'bg-ink font-medium text-paper' : 'text-ink-soft ring-1 ring-rule hover:bg-paper-3 hover:text-ink'
                  } ${q && count === 0 ? 'opacity-40' : ''}`}
                >
                  {t.label}
                  <span className={`text-xs tabular-nums ${active ? 'text-paper/60' : 'text-ink-muted'}`}>{count}</span>
                </a>
              )
            })}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, series…"
            className="w-full rounded-full bg-paper-3 px-4 py-1.5 text-sm ring-1 ring-rule outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-accent sm:w-64"
          />
        </div>
      </div>

      {/* Current page */}
      <section role="tabpanel" className="pt-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">{tab.label}</h1>
          <p className="text-sm text-ink-soft">
            {visible.length} {visible.length === 1 ? 'book' : 'books'}
            {isYear && ` · ${formatNum(sumPages(visible))} pages`}
            {q && ` matching “${q}”`}
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="py-20 text-center text-ink-soft">
            Nothing in {tab.label} matches “{q}”. Try another tab — the numbers show where matches are.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {visible.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      {/* Previous / next page */}
      <nav aria-label="Pages" className="mt-16 grid grid-cols-2 gap-3 border-t border-rule pt-6">
        {prev ? (
          <a href={href.library(prev.id)} className="group rounded-xl p-4 ring-1 ring-rule hover:bg-paper-2">
            <span className="text-xs text-ink-muted">← Previous</span>
            <span className="block font-serif text-xl font-semibold group-hover:text-accent">{prev.label}</span>
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={href.library(next.id)} className="group rounded-xl p-4 text-right ring-1 ring-rule hover:bg-paper-2">
            <span className="text-xs text-ink-muted">Next →</span>
            <span className="block font-serif text-xl font-semibold group-hover:text-accent">{next.label}</span>
          </a>
        )}
      </nav>
    </div>
  )
}
