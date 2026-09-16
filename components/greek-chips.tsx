"use client"

import { cn } from "@/lib/utils"
import type { GreekWord } from "@/lib/types"

export function GreekChips({
  words,
  onSelect,
  featuredLemma,
}: {
  words: GreekWord[]
  onSelect: (word: GreekWord) => void
  featuredLemma?: string
}) {
  if (!words.length) {
    return (
      <p className="text-xs text-muted-foreground">
        Sem tokens gregos alinhados neste versículo.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {words.map((word, index) => {
        const featured = featuredLemma && word.lemma === featuredLemma
        return (
          <button
            key={`${word.surface}-${index}`}
            type="button"
            onClick={() => onSelect(word)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-serif text-sm transition-colors",
              featured
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border bg-card/80 text-foreground/90 hover:border-primary/50 hover:bg-primary/10"
            )}
          >
            {word.surface}
          </button>
        )
      })}
    </div>
  )
}
