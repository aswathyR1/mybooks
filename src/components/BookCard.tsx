import { useState } from 'react'
import type { Book } from '../types'
import { Stars } from './Stars'

// Stable, pleasant hue per title for books without a cover image.
function hueFor(text: string) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

function PlaceholderCover({ book, small }: { book: Book; small?: boolean }) {
  const hue = hueFor(book.title)
  return (
    <div
      className={`flex h-full w-full flex-col justify-between text-white ${small ? 'p-1' : 'p-3'}`}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 40% 38%), hsl(${(hue + 40) % 360} 45% 20%))` }}
    >
      {!small && (
        <>
          <span className="font-serif text-sm leading-tight font-semibold">{book.title}</span>
          <span className="text-[11px] opacity-80">{book.author}</span>
        </>
      )}
    </div>
  )
}

export function Cover({ book, small }: { book: Book; small?: boolean }) {
  const [broken, setBroken] = useState(false)
  if (!book.cover || broken) return <PlaceholderCover book={book} small={small} />
  return (
    <img
      src={book.cover}
      alt={`Cover of ${book.title}`}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-full w-full object-cover"
    />
  )
}

export function BookCard({ book }: { book: Book }) {
  return (
    <a
      href={`https://www.goodreads.com/book/show/${book.id}`}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-2 focus-visible:outline-none"
      title={book.review ?? `${book.title} by ${book.author}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-paper-3 shadow-md shadow-black/40 ring-1 ring-white/5 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/60 group-hover:ring-accent/60 group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <Cover book={book} />
        {/* Subtle spine shading */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 font-serif text-[15px] leading-snug font-semibold group-hover:text-accent">
          {book.title}
        </h3>
        <p className="truncate text-xs text-ink-soft">{book.author}</p>
        {book.series && <p className="truncate text-[11px] text-ink-muted italic">{book.series}</p>}
        {book.rating > 0 && <Stars rating={book.rating} className="mt-1" />}
      </div>
    </a>
  )
}
