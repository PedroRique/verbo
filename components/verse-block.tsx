"use client"

import { Heart, Sparkles } from "lucide-react"

import { GreekChips } from "@/components/greek-chips"
import { Button } from "@/components/ui/button"
import { saveVerse, useSaved } from "@/hooks/use-bible-store"
import type { ExplainPayload, GreekWord, Verse } from "@/lib/types"

export function VerseBlock({
  book,
  bookName,
  chapter,
  verse,
  onWord,
  onExplain,
}: {
  book: string
  bookName: string
  chapter: number
  verse: Verse
  onWord: (word: GreekWord, payload: ExplainPayload) => void
  onExplain: (payload: ExplainPayload) => void
}) {
  const ref = `${bookName} ${chapter}:${verse.n}`
  const saved = useSaved(ref)
  const payload: ExplainPayload = {
    ref,
    pt: verse.pt,
    words: verse.words,
  }

  return (
    <article
      id={`v${verse.n}`}
      className="scroll-mt-24 border-b border-border/60 py-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 w-7 shrink-0 text-right font-heading text-sm text-primary">
          {verse.n}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="font-serif text-[1.05rem] leading-8 text-pretty">
            {verse.pt}
          </p>
          <GreekChips
            words={verse.words}
            onSelect={(word) => onWord(word, payload)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExplain(payload)}
            >
              <Sparkles className="size-3.5" />
              Explicar
            </Button>
            <Button
              size="sm"
              variant={saved ? "secondary" : "ghost"}
              onClick={() =>
                saveVerse({
                  ref,
                  book,
                  chapter,
                  verse: verse.n,
                  pt: verse.pt,
                  surface: verse.words[0]?.surface,
                  gloss: verse.words[0]?.gloss,
                })
              }
            >
              <Heart className={saved ? "fill-current" : ""} />
              {saved ? "Salvo" : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
