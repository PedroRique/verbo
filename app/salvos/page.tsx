"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { saveVerse, useSavedVerses } from "@/hooks/use-bible-store"
import { verseHref } from "@/lib/books"

export default function SalvosPage() {
  const saved = useSavedVerses()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6">
      <p className="text-[11px] tracking-[0.2em] text-primary uppercase">
        Guardados
      </p>
      <h1 className="font-heading text-3xl">Versículos salvos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ficam neste aparelho. Sem conta, sem nuvem.
      </p>

      {saved.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border px-5 py-10 text-center">
          <Heart className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-heading text-lg">Nada salvo ainda</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            No Reels ou na leitura, toque em Salvar. Volte aqui quando quiser
            reler o que te segurou.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/">Abrir os Reels</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {saved.map((item) => (
            <li
              key={item.ref}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="text-xs tracking-wide text-primary uppercase">
                {item.ref}
              </p>
              <p className="mt-2 font-serif text-base leading-7">{item.pt}</p>
              {item.surface ? (
                <p className="mt-2 font-serif text-lg text-primary">
                  {item.surface}
                  {item.gloss ? (
                    <span className="ml-2 font-sans text-sm text-muted-foreground">
                      {item.gloss}
                    </span>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href={verseHref(item.book, item.chapter, item.verse)}>
                    Ler no capítulo
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => saveVerse(item)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
