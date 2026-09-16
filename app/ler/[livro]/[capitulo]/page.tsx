import { notFound } from "next/navigation"

import { ReaderView } from "@/components/reader-view"
import { getBook, getChapter } from "@/lib/bible"
import { getBookMeta } from "@/lib/books"

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ livro: string; capitulo: string }>
}) {
  const { livro, capitulo } = await params
  const meta = getBookMeta(livro)
  const chapterNumber = Number(capitulo)
  if (!meta || !Number.isInteger(chapterNumber)) notFound()

  const book = await getBook(livro)
  const chapter = book ? getChapter(book, chapterNumber) : null
  if (!chapter) notFound()

  return <ReaderView meta={meta} chapter={chapter} />
}
