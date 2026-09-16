import { BottomNav } from "@/components/bottom-nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="flex-1 pb-[4.25rem]">{children}</div>
      <BottomNav />
    </div>
  )
}
