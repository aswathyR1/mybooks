// Five stars with partial fill, so ratings like 3.75 render accurately.
export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  const pct = (Math.min(rating, 5) / 5) * 100
  return (
    <div className={`relative inline-block whitespace-nowrap text-sm leading-none tracking-[2px] ${className}`} aria-label={`Rated ${rating} out of 5`}>
      <span className="text-rule">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-accent" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </div>
  )
}
