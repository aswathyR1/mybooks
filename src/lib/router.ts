import { useEffect, useState } from 'react'

// Tiny hash router. Hash URLs (#/library/2025) work on GitHub Pages without
// server rewrites, and every page/tab gets a shareable link.
export type Route = { page: 'dashboard' } | { page: 'library'; tab: string | null }

function parse(hash: string): Route {
  const [page, tab] = hash.replace(/^#\/?/, '').split('/')
  if (page === 'library') return { page: 'library', tab: tab ? decodeURIComponent(tab) : null }
  return { page: 'dashboard' }
}

export function useRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const href = {
  dashboard: '#/',
  library: (tab?: string) => (tab ? `#/library/${encodeURIComponent(tab)}` : '#/library'),
}
