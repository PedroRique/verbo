"use client"

import { useEffect, useState } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ExplainPayload } from "@/lib/types"

export function ExplainSheet({
  payload,
  open,
  onOpenChange,
}: {
  payload: ExplainPayload | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] gap-0 rounded-t-3xl"
      >
        <SheetHeader className="border-b border-border/70">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Linha reformada
          </p>
          <SheetTitle className="font-heading text-lg">
            {payload?.ref ?? "Explicação"}
          </SheetTitle>
          <SheetDescription>
            {payload?.focus
              ? `Foco em ${payload.focus.surface} · ${payload.focus.gloss}`
              : "Leitura do versículo à luz de Cristo e das Escrituras."}
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 py-4">
          {open && payload ? (
            <ExplainBody key={`${payload.ref}-${payload.focus?.lemma ?? "all"}`} payload={payload} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ExplainBody({ payload }: { payload: ExplainPayload }) {
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        if (!response.ok || !response.body) {
          throw new Error("Não foi possível explicar este versículo agora.")
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let acc = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          setText(acc)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível explicar este versículo agora."
        )
      }
    }

    void run()
    return () => controller.abort()
  }, [payload])

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!text) {
    return (
      <p className="text-sm text-muted-foreground">
        Abrindo o texto com calma...
      </p>
    )
  }

  return <MarkdownLite text={text} />
}

function MarkdownLite({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/)
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        const heading = block.match(/^#{1,3}\s+(.*)/)
        if (heading) {
          return (
            <h3
              key={index}
              className="font-heading text-base text-primary"
            >
              {heading[1]}
            </h3>
          )
        }
        return (
          <p key={index} className="whitespace-pre-wrap text-foreground/90">
            {inlineBold(block)}
          </p>
        )
      })}
    </div>
  )
}

function inlineBold(value: string) {
  const parts = value.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    if (bold) {
      return (
        <strong key={index} className="font-medium text-foreground">
          {bold[1]}
        </strong>
      )
    }
    return <span key={index}>{part}</span>
  })
}
