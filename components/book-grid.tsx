"use client"

import Link from "next/link"

import { bookList } from "@/lib/books"
import { useLastReading } from "@/hooks/use-bible-store"

export function BookGrid() {
  const last = useLastReading()
  const lastMeta = last
    ? bookList.find((book) => book.slug === last.book)
    : null

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6">
      <header className="mb-6">
        <p className="text-[11px] tracking-[0.2em] text-primary uppercase">
          Novo Testamento
        </p>
        <h1 className="font-heading text-3xl">Ler a Escritura</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Toque qualquer palavra grega debaixo do versículo. O original não é
          um truque de erudito: é o texto que a igreja recebeu.
        </p>
      </header>

      {last && lastMeta ? (
        <Link
          href={`/ler/${last.book}/${last.chapter}`}
          className="mb-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <div>
            <p className="text-xs tracking-wide text-primary uppercase">
              Continuar
            </p>
            <p className="font-heading text-lg">
              {lastMeta.name} {last.chapter}
            </p>
          </div>
          <span className="text-sm text-primary">Abrir</span>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {bookList.map((book) => (
          <Link
            key={book.slug}
            href={`/ler/${book.slug}`}
            className="rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <p className="font-heading text-base leading-tight">{book.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {book.chapters} {book.chapters === 1 ? "capítulo" : "capítulos"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
