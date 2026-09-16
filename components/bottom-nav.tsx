"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Heart, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Reels", icon: Sparkles },
  { href: "/ler", label: "Ler", icon: BookOpen },
  { href: "/salvos", label: "Salvos", icon: Heart },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md">
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium tracking-wide",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
