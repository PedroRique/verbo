"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { ExplainSheet } from "@/components/explain-sheet"
import { VerseBlock } from "@/components/verse-block"
import { WordSheet } from "@/components/word-sheet"
import { rememberReading } from "@/hooks/use-bible-store"
import type { BookMeta, Chapter, ExplainPayload, GreekWord } from "@/lib/types"

export function ReaderView({
  meta,
  chapter,
}: {
  meta: BookMeta
  chapter: Chapter
}) {
  const [word, setWord] = useState<GreekWord | null>(null)
  const [wordPayload, setWordPayload] = useState<ExplainPayload | null>(null)
  const [explain, setExplain] = useState<ExplainPayload | null>(null)

  useEffect(() => {
    rememberReading(meta.slug, chapter.n)
  }, [meta.slug, chapter.n])

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link
            href={`/ler/${meta.slug}`}
            className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Voltar aos capítulos"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0">
            <p className="font-heading text-lg leading-tight">{meta.name}</p>
            <p className="text-xs text-muted-foreground">
              Capítulo {chapter.n} · toque o grego
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: meta.chapters }, (_, index) => {
            const n = index + 1
            const active = n === chapter.n
            return (
              <Link
                key={n}
                href={`/ler/${meta.slug}/${n}`}
                className={
                  active
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                }
              >
                {n}
              </Link>
            )
          })}
        </div>
      </header>

      <div className="px-4 pb-10">
        {chapter.verses.map((verse) => (
          <VerseBlock
            key={verse.n}
            book={meta.slug}
            bookName={meta.name}
            chapter={chapter.n}
            verse={verse}
            onWord={(nextWord, payload) => {
              setWord(nextWord)
              setWordPayload({ ...payload, focus: nextWord })
            }}
            onExplain={setExplain}
          />
        ))}
        <p className="pt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          Português: Bíblia Livre (CC BY 3.0 BR). Grego: SBLGNT + MACULA
          (CC BY 4.0).
        </p>
      </div>

      <WordSheet
        word={word}
        verseRef={wordPayload?.ref}
        open={Boolean(word)}
        onOpenChange={(open) => {
          if (!open) setWord(null)
        }}
        onExplain={() => {
          if (wordPayload) {
            setExplain(wordPayload)
            setWord(null)
          }
        }}
      />
      <ExplainSheet
        payload={explain}
        open={Boolean(explain)}
        onOpenChange={(open) => {
          if (!open) setExplain(null)
        }}
      />
    </div>
  )
}
