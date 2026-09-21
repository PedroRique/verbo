import { cache } from "react"
import path from "node:path"

import { getBookMeta } from "@/lib/books"
import { readJsonFile } from "@/lib/read-json"
import type { Book, Chapter, ReelCard } from "@/lib/types"

export { bookList, getBookMeta, verseHref } from "@/lib/books"

export const getBook = cache(async (slug: string): Promise<Book | null> => {
  if (!getBookMeta(slug)) return null
  const file = path.join(process.cwd(), "data", "nt", slug)
  return readJsonFile<Book>(file)
})

export const getReels = cache(async (): Promise<ReelCard[]> => {
  const file = path.join(process.cwd(), "data", "reels")
  return readJsonFile<ReelCard[]>(file)
})

export function getChapter(book: Book, n: number): Chapter | null {
  return book.chapters.find((chapter) => chapter.n === n) ?? null
}
