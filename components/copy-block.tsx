"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyBlock({
  code,
  filename,
}: {
  code: string
  filename?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-1.5">
        <span className="truncate font-mono text-[11px] text-amber-200/70">
          {filename ?? "PowerShell"}
        </span>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={copy}
          className="text-zinc-300 hover:text-white"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-[12px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  )
}
