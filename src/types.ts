export type Status = 'read' | 'reading' | 'want' | 'dnf'

export interface Book {
  id: string
  title: string
  series: string | null
  author: string
  rating: number
  pages: number | null
  published: number | null
  dateAdded: string
  status: Status
  /** Year ("2025") or era ("2005-2020") the book was read in; null unless status is "read". */
  group: string | null
  dateRead: string | null
  review: string | null
  cover: string | null
}
