"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function writeClipboard(text: string) {
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.left = "-9999px"
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand("copy")
  area.remove()
  if (!ok) throw new Error("copy failed")
}

export function CopyBlock({
  code,
  filename,
}: {
  code: string
  filename?: string
}) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number>(0)

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
      } else {
        writeClipboard(code)
      }
    } catch {
      writeClipboard(code)
    }
    setCopied(true)
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopied(false), 2500)
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
          aria-live="polite"
          className={cn(
            "min-w-[5.5rem] text-zinc-300 hover:text-white",
            copied && "bg-emerald-500/15 text-emerald-300 hover:text-emerald-200"
          )}
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
