import booksJson from "@/data/books.json"

import type { BookMeta } from "@/lib/types"

export const bookList = booksJson as BookMeta[]

export function getBookMeta(slug: string) {
  return bookList.find((book) => book.slug === slug) ?? null
}

export function verseHref(book: string, chapter: number, verse?: number) {
  const base = `/ler/${book}/${chapter}`
  return verse ? `${base}#v${verse}` : base
}
