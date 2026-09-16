import type { Metadata } from "next"
import { Fraunces, Geist, Geist_Mono, Noto_Serif } from "next/font/google"

import { AppShell } from "@/components/app-shell"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "latin-ext", "greek"],
})

export const metadata: Metadata = {
  title: "Verbo — Bíblia com o original ao toque",
  description:
    "Novo Testamento em português, grego clicável, explicação na linha cristã reformada e Reels da Bíblia.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
