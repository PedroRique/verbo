#Requires -Version 5.1
<#
.SYNOPSIS
  Apaga cache, logs e backups do Cursor. Nao mexe no state.vscdb (historico de chat).

.PARAMETER IncludeIndex
  Tambem apaga indice de retrieval e search de conversas (reconstruidos depois).

.PARAMETER IncludeAgentWorker
  Esvazia anysphere.cursor-agent-worker (logs/artefatos de agentes).

.PARAMETER IncludeBackup
  Apaga state.vscdb.backup (o Cursor recria).
#>
param(
  [switch]$IncludeIndex,
  [switch]$IncludeAgentWorker,
  [switch]$IncludeBackup,
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

$running = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
if ($running) {
  Write-Host "Feche o Cursor por completo (File > Exit e icone da bandeja) e rode de novo." -ForegroundColor Red
  exit 1
}

function Remove-PathSafe($path, $why) {
  if (-not (Test-Path -LiteralPath $path)) {
    Write-Host ("  skip  {0}" -f $path) -ForegroundColor DarkGray
    return
  }
  $bytes = (Get-ChildItem -LiteralPath $path -Force -Recurse -File -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum).Sum
  $gib = if ($bytes) { "{0:N2} GiB" -f ($bytes / 1GB) } else { "0 GiB" }
  Write-Host ("  {0,-10} {1}  ({2})" -f $(if ($WhatIf) { "WHATIF" } else { "apagando" }), $path, $gib)
  Write-Host ("           {0}" -f $why) -ForegroundColor DarkGray
  if (-not $WhatIf) {
    Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue
  }
}

$roaming = Join-Path $env:APPDATA "Cursor"
$local = Join-Path $env:LOCALAPPDATA "Cursor"
$gs = Join-Path $roaming "User\globalStorage"

Write-Host ""
Write-Host "Limpeza segura do Cursor" -ForegroundColor Cyan
Write-Host "Nao toca em state.vscdb / storage.json / settings."
Write-Host ""

$always = @(
  @{ Path = Join-Path $roaming "Cache"; Why = "cache Electron" }
  @{ Path = Join-Path $roaming "CachedData"; Why = "cache de JS compilado" }
  @{ Path = Join-Path $roaming "Code Cache"; Why = "code cache" }
  @{ Path = Join-Path $roaming "GPUCache"; Why = "cache GPU" }
  @{ Path = Join-Path $roaming "logs"; Why = "logs" }
  @{ Path = Join-Path $roaming "Crashpad"; Why = "crash dumps" }
  @{ Path = Join-Path $local "Cache"; Why = "cache local" }
  @{ Path = Join-Path $local "CachedData"; Why = "cache local" }
  @{ Path = Join-Path $local "GPUCache"; Why = "cache GPU local" }
  @{ Path = Join-Path $local "logs"; Why = "logs locais" }
  @{ Path = Join-Path $gs "mcp-oauth-attempts"; Why = "logs de OAuth MCP" }
  @{ Path = Join-Path $gs "mhutchie.git-graph"; Why = "cache Git Graph" }
)

foreach ($item in $always) { Remove-PathSafe $item.Path $item.Why }

if ($IncludeBackup) {
  Remove-PathSafe (Join-Path $gs "state.vscdb.backup") "backup automatico do banco"
}

if ($IncludeIndex) {
  Remove-PathSafe (Join-Path $gs "anysphere.cursor-retrieval") "indice de codebase (reconstroi)"
  Remove-PathSafe (Join-Path $gs "conversation-search.db") "indice de busca de chats (reconstroi)"
}

if ($IncludeAgentWorker) {
  Remove-PathSafe (Join-Path $gs "anysphere.cursor-agent-worker") "artefatos do agent worker"
}

Write-Host ""
Write-Host "Pronto. Abra o Cursor e rode:" -ForegroundColor Green
Write-Host "  Ctrl+Shift+P  >  Developer: GC Agent KV Blobs"
Write-Host "  Ctrl+Shift+P  >  Developer: Delete Old Chats...   (se puder perder chats antigos)"
Write-Host ""
Write-Host "O GC precisa de espaco livre ~ do tamanho do state.vscdb. Se o C: estiver apertado, use mover-para-d.ps1 primeiro."
Write-Host ""
