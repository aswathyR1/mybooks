import type { ReactNode } from 'react'

export interface BarItem {
  key: string
  label: ReactNode
  value: number
  /** Shown on hover/focus, in addition to the value. */
  detail?: string
  href?: string
}

// Horizontal single-series bar chart: one baseline, ≤24px bars with a rounded
// data end, value at the tip, and a hover/focus tooltip on the whole row.
export function BarList({ items, unit, labelWidth = '7rem' }: { items: BarItem[]; unit: string; labelWidth?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Row = item.href ? 'a' : 'div'
        return (
          <li key={item.key}>
            <Row
              href={item.href}
              tabIndex={item.href ? undefined : 0}
              className="group relative grid items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-paper-3 focus-visible:bg-paper-3"
              style={{ gridTemplateColumns: `${labelWidth} 1fr` }}
              aria-label={`${typeof item.label === 'string' ? item.label : item.key}: ${item.value} ${unit}`}
            >
              <span className="truncate text-ink-soft group-hover:text-ink">{item.label}</span>
              {/* Bars scale to the track; right padding leaves room for the value at the longest bar's tip */}
              <span className="flex min-w-0 items-center pr-8">
                <span
                  className="h-3.5 shrink-0 rounded-r-[4px] bg-mark transition-[width] duration-500"
                  style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value ? 4 : 0 }}
                />
                <span className="ml-2 shrink-0 text-xs tabular-nums text-ink-soft">{item.value}</span>
              </span>
              {/* Tooltip */}
              <span className="pointer-events-none absolute right-2 bottom-full z-10 mb-1 hidden rounded-md bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-paper shadow-lg group-hover:block group-focus-visible:block">
                <strong className="font-semibold">
                  {item.value} {unit}
                </strong>
                {item.detail && <span className="text-paper/70"> · {item.detail}</span>}
              </span>
            </Row>
          </li>
        )
      })}
    </ul>
  )
}
