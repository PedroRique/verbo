import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { getBookMeta } from "@/lib/books"

export default async function BookIndexPage({
  params,
}: {
  params: Promise<{ livro: string }>
}) {
  const { livro } = await params
  const meta = getBookMeta(livro)
  if (!meta) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6">
      <Link
        href="/ler"
        className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Todos os livros
      </Link>
      <h1 className="font-heading text-3xl">{meta.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {meta.chapters} {meta.chapters === 1 ? "capítulo" : "capítulos"} · Bíblia
        Livre
      </p>
      <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {Array.from({ length: meta.chapters }, (_, index) => {
          const n = index + 1
          return (
            <Link
              key={n}
              href={`/ler/${meta.slug}/${n}`}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-card font-heading text-sm hover:border-primary/50 hover:bg-muted/40"
            >
              {n}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
