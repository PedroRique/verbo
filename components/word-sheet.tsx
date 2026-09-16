"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { GreekWord } from "@/lib/types"

export function WordSheet({
  word,
  verseRef,
  open,
  onOpenChange,
  onExplain,
}: {
  word: GreekWord | null
  verseRef?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onExplain?: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 rounded-t-3xl border-border"
      >
        {word ? (
          <>
            <SheetHeader className="border-b border-border/70 pb-4">
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                Palavra original
              </p>
              <SheetTitle className="font-serif text-4xl font-medium tracking-wide text-primary">
                {word.surface}
              </SheetTitle>
              <SheetDescription>
                {verseRef ? `${verseRef} · ` : ""}
                lema {word.lemma}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 overflow-y-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {word.strongs ? <Badge>{word.strongs}</Badge> : null}
                <Badge variant="secondary">{word.pos}</Badge>
              </div>
              {word.morph ? (
                <p className="text-sm text-muted-foreground">{word.morph}</p>
              ) : null}
              <div>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  Sentido
                </p>
                <p className="mt-1 font-serif text-xl leading-snug">
                  {word.gloss}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                O grego não substitui o texto em português: ele aprofunda. Leia
                o versículo inteiro, depois esta palavra, e deixe a Escritura
                interpretar a Escritura.
              </p>
            </div>
            {onExplain ? (
              <SheetFooter>
                <Button className="w-full" onClick={onExplain}>
                  Explicar no versículo
                </Button>
              </SheetFooter>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
