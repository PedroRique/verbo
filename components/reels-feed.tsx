"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BookOpen, ChevronUp, Heart, Sparkles } from "lucide-react"

import { ExplainSheet } from "@/components/explain-sheet"
import { GreekChips } from "@/components/greek-chips"
import { WordSheet } from "@/components/word-sheet"
import { Button } from "@/components/ui/button"
import { saveVerse, useSaved } from "@/hooks/use-bible-store"
import { verseHref } from "@/lib/books"
import type { ExplainPayload, GreekWord, ReelCard } from "@/lib/types"

export function ReelsFeed({ reels }: { reels: ReelCard[] }) {
  const [word, setWord] = useState<GreekWord | null>(null)
  const [explain, setExplain] = useState<ExplainPayload | null>(null)
  const [active, setActive] = useState(reels[0]?.id ?? "")
  const [wordPayload, setWordPayload] = useState<ExplainPayload | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const cards = [...root.querySelectorAll<HTMLElement>("[data-reel]")]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target instanceof HTMLElement) {
          setActive(visible.target.dataset.reel ?? "")
        }
      },
      { root, threshold: 0.6 }
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [reels])

  if (!reels.length) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center px-6 text-center">
        <p className="text-muted-foreground">
          Ainda não há reels. Rode o gerador de dados do Novo Testamento.
        </p>
      </div>
    )
  }

  return (
    <>
      <div
        ref={scroller}
        className="h-[calc(100dvh-4.25rem)] snap-y snap-mandatory overflow-y-auto scroll-smooth"
      >
        {reels.map((reel, index) => (
          <ReelSlide
            key={reel.id}
            reel={reel}
            isActive={reel.id === active}
            showHint={index === 0}
            onWord={(next) => {
              const payload = toPayload(reel, next)
              setWord(next)
              setWordPayload(payload)
            }}
            onExplain={(focus) => setExplain(toPayload(reel, focus))}
          />
        ))}
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
    </>
  )
}

function ReelSlide({
  reel,
  isActive,
  showHint,
  onWord,
  onExplain,
}: {
  reel: ReelCard
  isActive: boolean
  showHint: boolean
  onWord: (word: GreekWord) => void
  onExplain: (focus?: GreekWord) => void
}) {
  const saved = useSaved(reel.ref)

  return (
    <section
      data-reel={reel.id}
      data-active={isActive}
      className="relative flex h-[calc(100dvh-4.25rem)] snap-start flex-col justify-between px-5 py-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.45_0.12_75_/_0.22),transparent_42%)]" />
      <header className="relative flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
            Reels da Bíblia
          </p>
          <h2 className="font-heading text-xl">{reel.ref}</h2>
        </div>
        {reel.curated ? (
          <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] tracking-wide text-primary uppercase">
            Reforma
          </span>
        ) : null}
      </header>

      <div className="relative space-y-5">
        <p className="font-serif text-[1.55rem] leading-snug text-pretty sm:text-[1.75rem]">
          {reel.pt}
        </p>
        <button
          type="button"
          onClick={() => onWord(reel.featured)}
          className="block text-left"
        >
          <p className="font-serif text-4xl tracking-wide text-primary sm:text-5xl">
            {reel.featured.surface}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reel.featured.lemma}
            {reel.featured.strongs ? ` · ${reel.featured.strongs}` : ""} ·{" "}
            {reel.featured.gloss}
          </p>
        </button>
        <p className="max-w-lg text-sm leading-relaxed text-foreground/85">
          {reel.reflection}
        </p>
        <GreekChips
          words={reel.words}
          featuredLemma={reel.featured.lemma}
          onSelect={onWord}
        />
      </div>

      <div className="relative space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onExplain(reel.featured)}>
            <Sparkles className="size-4" />
            Explicar
          </Button>
          <Button variant="outline" asChild>
            <Link href={verseHref(reel.book, reel.chapter, reel.verse)}>
              <BookOpen className="size-4" />
              Ler o capítulo
            </Link>
          </Button>
          <Button
            variant={saved ? "secondary" : "ghost"}
            onClick={() =>
              saveVerse({
                ref: reel.ref,
                book: reel.book,
                chapter: reel.chapter,
                verse: reel.verse,
                pt: reel.pt,
                surface: reel.featured.surface,
                gloss: reel.featured.gloss,
              })
            }
          >
            <Heart className={saved ? "fill-current" : ""} />
            {saved ? "Salvo" : "Salvar"}
          </Button>
        </div>
        {showHint ? (
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ChevronUp className="size-3.5" />
            Deslize para o próximo versículo
          </p>
        ) : null}
      </div>
    </section>
  )
}

function toPayload(reel: ReelCard, focus?: GreekWord | null): ExplainPayload {
  return {
    ref: reel.ref,
    pt: reel.pt,
    words: reel.words,
    focus: focus ?? null,
  }
}
