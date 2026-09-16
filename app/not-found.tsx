import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.2em] text-primary uppercase">
        404
      </p>
      <h1 className="mt-2 font-heading text-3xl">Este capítulo não existe</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        O Novo Testamento está inteiro aqui, mas este endereço não cai em
        nenhum livro ou capítulo.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/ler">Escolher um livro</Link>
      </Button>
    </div>
  )
}
