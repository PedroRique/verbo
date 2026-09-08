"use client"

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  DownloadIcon,
  HardDriveIcon,
  ShieldAlertIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"

import { CopyBlock } from "@/components/copy-block"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  easyWinGiB,
  globalStorageItems,
  listedTotalGiB,
  rebuildGiB,
  type Risk,
} from "@/lib/storage"

const closeCursor = `Get-Process Cursor -ErrorAction SilentlyContinue | Stop-Process
# Confira a bandeja (canto inferior direito) — o Cursor costuma ficar aberto la.`

const measureCmd = `Set-ExecutionPolicy -Scope Process Bypass
cd $HOME\\Downloads   # ou a pasta onde voce salvou os scripts
.\\medir-cursor.ps1`

const cleanCmd = `Set-ExecutionPolicy -Scope Process Bypass
.\\limpar-seguro.ps1 -IncludeBackup -IncludeIndex -IncludeAgentWorker`

const moveCmd = `Set-ExecutionPolicy -Scope Process Bypass
# Precisa de ~110 GiB livres no D:
.\\mover-para-d.ps1 -DestRoot D:\\CursorData`

const shortcutTarget = `"%LOCALAPPDATA%\\Programs\\Cursor\\Cursor.exe" --user-data-dir "D:\\CursorUserData"`

const riskLabel: Record<Risk, string> = {
  safe: "Pode apagar",
  rebuild: "Reconstroi",
  keep: "Nao apague",
}

const riskClass: Record<Risk, string> = {
  safe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rebuild: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  keep: "border-rose-500/30 bg-rose-500/10 text-rose-200",
}

export function DiskGuide() {
  const max = Math.max(...globalStorageItems.map((item) => item.sizeGiB))

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5">
        <p className="text-xs font-medium tracking-[0.2em] text-amber-400/90 uppercase">
          Windows · C: apertado
        </p>
        <h1 className="font-heading max-w-3xl text-4xl leading-[1.05] font-medium tracking-tight text-zinc-50 sm:text-5xl">
          O Cursor está comendo o disco. Dá para enxugar — ou jogar tudo no D:.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-400">
          No seu <code className="text-zinc-200">globalStorage</code> só os
          maiores arquivos já passam de{" "}
          <strong className="text-zinc-100">
            {listedTotalGiB.toFixed(0)} GiB
          </strong>
          . Não é o programa em si: é histórico de chat, índice, backup e logs
          que o Cursor ainda não limpa sozinho.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="h-6 rounded-full border-amber-500/40 bg-amber-500/15 text-amber-100">
            ~{easyWinGiB.toFixed(0)} GiB dá para apagar hoje
          </Badge>
          <Badge
            variant="outline"
            className="h-6 rounded-full border-white/15 text-zinc-300"
          >
            ~{rebuildGiB.toFixed(0)} GiB reconstroem depois
          </Badge>
        </div>
      </header>

      <Alert className="border-amber-500/25 bg-amber-500/8 text-amber-50">
        <ShieldAlertIcon />
        <AlertTitle>Antes de qualquer coisa, feche o Cursor</AlertTitle>
        <AlertDescription className="text-amber-100/80">
          File → Exit, e mate o ícone da bandeja. Mexer em{" "}
          <code>state.vscdb</code> com o editor aberto corrompe o histórico
          (“Loading Chat…” para sempre). O{" "}
          <code>state.vscdb-shm</code> de 8 GiB some quando o processo morre.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Neste print"
          value={`${listedTotalGiB.toFixed(0)} GiB`}
          hint="só os 10 maiores de globalStorage"
        />
        <Stat
          label="Lixo + cache"
          value={`${easyWinGiB.toFixed(0)} GiB`}
          hint="backup, logs MCP, Git Graph, shm"
        />
        <Stat
          label="Caminho real"
          value="AppData"
          hint="C:\Users\C302562\AppData\Roaming\Cursor"
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl text-zinc-50">O que está inchado</h2>
          <p className="hidden text-sm text-zinc-500 sm:block">
            Do print do WizTree / WinDirStat
          </p>
        </div>
        <Card className="bg-zinc-950/60 ring-white/8">
          <CardContent className="flex flex-col gap-3 pt-1">
            {globalStorageItems.map((item) => (
              <div key={item.name} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-mono text-[13px] text-zinc-200">
                      {item.name}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${riskClass[item.risk]}`}
                    >
                      {riskLabel[item.risk]}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-zinc-300">
                    {item.sizeGiB.toFixed(2)} GiB
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-amber-600 to-amber-300"
                    style={{ width: `${(item.sizeGiB / max) * 100}%` }}
                  />
                </div>
                <p className="text-[13px] leading-5 text-zinc-500">
                  {item.what} {item.action}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="limpar" className="gap-5">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-zinc-900 p-1 sm:w-fit">
          <TabsTrigger value="limpar" className="px-3">
            <Trash2Icon data-icon="inline-start" />
            Enxugar no C:
          </TabsTrigger>
          <TabsTrigger value="mover" className="px-3">
            <HardDriveIcon data-icon="inline-start" />
            Jogar no D:
          </TabsTrigger>
        </TabsList>

        <TabsContent value="limpar" className="flex flex-col gap-5">
          <Card className="bg-zinc-950/50">
            <CardHeader>
              <CardTitle>1. Comandos oficiais (sem apagar arquivo)</CardTitle>
              <CardDescription>
                O Cursor tem duas ferramentas internas. Apagar chat na barra
                lateral <em>não</em> libera disco — só estes comandos compactam
                o <code>state.vscdb</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-6 text-zinc-300">
                <li>
                  <code className="text-amber-200">Ctrl+Shift+P</code> →{" "}
                  <strong className="text-zinc-100">
                    Developer: GC Agent KV Blobs
                  </strong>
                  . Limpa restos de agentes e dá VACUUM. Não apaga chats. Em 22
                  GiB demora e precisa de espaço livre parecido com o tamanho
                  do banco.
                </li>
                <li>
                  <code className="text-amber-200">Ctrl+Shift+P</code> →{" "}
                  <strong className="text-zinc-100">
                    Developer: Delete Old Chats…
                  </strong>
                  . Escolha quantos dias guardar (7 ou 30). Aí sim o histórico
                  antigo some e o arquivo encolhe.
                </li>
              </ol>
              <Alert>
                <AlertTriangleIcon />
                <AlertTitle>Se o C: já está lotado, o GC pode falhar</AlertTitle>
                <AlertDescription>
                  Compactar um banco de 22 GiB precisa de ~22 GiB livres. Sem
                  isso, vá na aba “Jogar no D:” primeiro e compacte depois.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/50">
            <CardHeader>
              <CardTitle>2. Script de limpeza segura</CardTitle>
              <CardDescription>
                Apaga cache, logs, backup do banco, Git Graph e (opcional)
                índices. Não toca no <code>state.vscdb</code> vivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/scripts/medir-cursor.ps1" download>
                    <DownloadIcon />
                    medir-cursor.ps1
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/scripts/limpar-seguro.ps1" download>
                    <DownloadIcon />
                    limpar-seguro.ps1
                  </a>
                </Button>
              </div>
              <CopyBlock filename="medir primeiro" code={measureCmd} />
              <CopyBlock filename="PowerShell (como você)" code={cleanCmd} />
              <p className="text-sm text-zinc-500">
                Clique com o botão direito no <code>.ps1</code> → Executar com
                PowerShell, ou abra um PowerShell na pasta dos scripts. Se o
                Windows bloquear:{" "}
                <code>Unblock-File .\\limpar-seguro.ps1</code>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mover" className="flex flex-col gap-5">
          <Card className="bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Junction para o D: (recomendado)</CardTitle>
              <CardDescription>
                Move Roaming, Local e a pasta <code>.cursor</code> para{" "}
                <code>D:\CursorData</code> e deixa um atalho de pasta no C:. O
                Cursor não percebe a diferença — chats e settings continuam.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-6 text-zinc-300">
                <li>Confirme ~110 GiB livres no D: (ou o tamanho que o script medir).</li>
                <li>Feche o Cursor por completo.</li>
                <li>Rode o script. Ele usa robocopy /MOVE — o C: vai esvaziando conforme copia.</li>
                <li>Abra o Cursor e veja se os chats ainda estão lá.</li>
              </ol>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/scripts/mover-para-d.ps1" download>
                    <DownloadIcon />
                    mover-para-d.ps1
                  </a>
                </Button>
              </div>
              <CopyBlock filename="mover-para-d.ps1" code={moveCmd} />
              <Alert>
                <HardDriveIcon />
                <AlertTitle>Não desmonte o D: com o Cursor aberto</AlertTitle>
                <AlertDescription>
                  Junction não é cópia. Se o D: sumir, o Cursor quebra o banco.
                  SSD interno ou HD interno fixo — não pendrive.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Alternativa oficial: --user-data-dir</CardTitle>
              <CardDescription>
                A equipe do Cursor recomenda apontar o atalho para outra pasta
                em vez de symlink. Funciona, mas você precisa copiar os dados
                e passar a abrir sempre por esse atalho.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-6 text-zinc-300">
                <li>
                  Com o Cursor fechado, copie{" "}
                  <code>%APPDATA%\Cursor</code> para{" "}
                  <code>D:\CursorUserData</code>.
                </li>
                <li>
                  Atalho → Propriedades → Destino:
                </li>
              </ol>
              <CopyBlock filename="Destino do atalho" code={shortcutTarget} />
              <p className="text-sm text-zinc-500">
                Se abrir o Cursor pelo menu Iniciar antigo, ele volta a gravar
                no C:. O junction evita essa pegadinha.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="bg-white/10" />

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl text-zinc-50">Perguntas rápidas</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="delete-vscdb">
            <AccordionTrigger>Posso só apagar o state.vscdb?</AccordionTrigger>
            <AccordionContent>
              Não, se quiser manter os chats. Mover o arquivo para o D: e deixar
              o Cursor criar um banco novo zera o histórico local (código dos
              projetos fica). Use Delete Old Chats ou o junction.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sidebar">
            <AccordionTrigger>
              Apaguei chats na sidebar e o disco não baixou
            </AccordionTrigger>
            <AccordionContent>
              Normal. A UI não compacta o SQLite. Rode{" "}
              <code>Developer: GC Agent KV Blobs</code> e, se quiser,{" "}
              <code>Developer: Delete Old Chats…</code>.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="more-folders">
            <AccordionTrigger>Só o globalStorage é grande?</AccordionTrigger>
            <AccordionContent>
              Não. Rode <code>medir-cursor.ps1</code>. Também incham{" "}
              <code>%LOCALAPPDATA%\Cursor</code> (cache/updates) e{" "}
              <code>%USERPROFILE%\.cursor</code> (transcrições de agentes). O
              script de mover leva as três.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="close">
            <AccordionTrigger>Como tenho certeza que fechou?</AccordionTrigger>
            <AccordionContent>
              <CopyBlock filename="PowerShell" code={closeCursor} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <footer className="flex flex-col gap-3 pb-8 text-sm text-zinc-500">
        <p className="flex items-center gap-2 text-zinc-400">
          <SparklesIcon className="size-4 text-amber-400" />
          Medir → limpar o lixo → mover o resto para o D: se o C: continuar
          apertado.
        </p>
        <p>
          Fontes: fórum do Cursor sobre{" "}
          <Link
            className="text-amber-200/90 underline-offset-4 hover:underline"
            href="https://forum.cursor.com/t/cursor-database-too-large-state-vscdb/168926"
            target="_blank"
          >
            state.vscdb gigante
          </Link>{" "}
          e o comando oficial{" "}
          <span className="text-zinc-300">Developer: Delete Old Chats</span>.
        </p>
        <p className="flex items-center gap-1">
          Scripts também estão em <code>scripts/</code> neste repo
          <ArrowRightIcon className="size-3.5" />
          <CheckIcon className="size-3.5 text-emerald-400" />
        </p>
      </footer>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <Card size="sm" className="bg-zinc-950/60 ring-white/8">
      <CardHeader>
        <CardDescription className="text-zinc-500">{label}</CardDescription>
        <CardTitle className="font-heading text-2xl text-zinc-50">
          {value}
        </CardTitle>
        <p className="text-xs leading-5 text-zinc-500">{hint}</p>
      </CardHeader>
    </Card>
  )
}
