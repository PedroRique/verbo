import { cache } from "react"
import { readFile } from "node:fs/promises"
import path from "node:path"

import { getBookMeta } from "@/lib/books"
import type { Book, Chapter } from "@/lib/types"

export { bookList, getBookMeta, verseHref } from "@/lib/books"

export const getBook = cache(async (slug: string): Promise<Book | null> => {
  if (!getBookMeta(slug)) return null
  const file = path.join(process.cwd(), "data", "nt", `${slug}.json`)
  const raw = await readFile(file, "utf8")
  return JSON.parse(raw) as Book
})

export function getChapter(book: Book, n: number): Chapter | null {
  return book.chapters.find((chapter) => chapter.n === n) ?? null
}
