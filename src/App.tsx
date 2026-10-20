import { OWNER } from './lib/books'
import { href, useRoute } from './lib/router'
import { Dashboard } from './pages/Dashboard'
import { Library } from './pages/Library'

export default function App() {
  const route = useRoute()

  const navItems = [
    { label: 'Dashboard', href: href.dashboard, active: route.page === 'dashboard' },
    { label: 'Library', href: href.library(), active: route.page === 'library' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 py-5">
        <a href={href.dashboard} className="font-serif text-xl font-bold sm:text-2xl">
          {OWNER}'s Bookshelf
        </a>
        <nav className="flex gap-1 rounded-full bg-paper-2 p-1 ring-1 ring-rule">
          {navItems.map((n) => (
            <a
              key={n.label}
              href={n.href}
              aria-current={n.active ? 'page' : undefined}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                n.active ? 'bg-paper-3 font-medium text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <main>{route.page === 'library' ? <Library key="library" tabId={route.tab} /> : <Dashboard />}</main>

      <footer className="border-t border-rule py-8 text-center text-xs text-ink-muted">
        Data from Goodreads · Covers from Open Library
      </footer>
    </div>
  )
}
