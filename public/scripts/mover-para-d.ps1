#Requires -Version 5.1
<#
.SYNOPSIS
  Move os dados do Cursor para o D: e deixa um junction no lugar original.
  Atalhos e o proprio Cursor continuam usando os mesmos caminhos.

.PARAMETER DestRoot
  Pasta raiz no D: (default D:\CursorData).

.PARAMETER WhatIf
  So mostra o que faria.
#>
param(
  [string]$DestRoot = "D:\CursorData",
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

function Test-CursorRunning {
  return [bool](Get-Process -Name "Cursor" -ErrorAction SilentlyContinue)
}

function Test-Junction($path) {
  if (-not (Test-Path -LiteralPath $path)) { return $false }
  $item = Get-Item -LiteralPath $path -Force
  return [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
}

function Get-FolderBytes($path) {
  if (-not (Test-Path -LiteralPath $path)) { return [int64]0 }
  $sum = (Get-ChildItem -LiteralPath $path -Force -Recurse -File -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum).Sum
  if ($null -eq $sum) { return [int64]0 }
  return [int64]$sum
}

function Move-WithJunction {
  param(
    [string]$Source,
    [string]$Dest,
    [string]$Label
  )

  Write-Host ""
  Write-Host ">> $Label" -ForegroundColor Cyan
  Write-Host "   de  $Source"
  Write-Host "   para $Dest"

  if (-not (Test-Path -LiteralPath $Source)) {
    Write-Host "   skip: origem nao existe." -ForegroundColor DarkGray
    return
  }

  if (Test-Junction $Source) {
    $target = (Get-Item -LiteralPath $Source).Target
    Write-Host "   ja e junction -> $target" -ForegroundColor Yellow
    return
  }

  $need = Get-FolderBytes $Source
  Write-Host ("   tamanho: {0:N2} GiB" -f ($need / 1GB))

  $driveLetter = ([IO.Path]::GetPathRoot($Dest)).Substring(0, 1)
  $drive = Get-PSDrive -Name $driveLetter -ErrorAction SilentlyContinue
  if ($drive -and ($drive.Free -lt $need)) {
    throw "Espaco insuficiente em ${driveLetter}: precisa ~$([math]::Round($need/1GB,2)) GiB livres."
  }

  if ($WhatIf) {
    Write-Host "   WHATIF: mover e criar junction." -ForegroundColor Yellow
    return
  }

  New-Item -ItemType Directory -Path $Dest -Force | Out-Null

  $robocopy = Get-Command robocopy -ErrorAction Stop
  & $robocopy.Source $Source $Dest /E /MOVE /COPY:DAT /R:2 /W:3 /XJ /NFL /NDL /NP
  $code = $LASTEXITCODE
  if ($code -ge 8) {
    throw "robocopy falhou com codigo $code ao mover $Source"
  }

  if (Test-Path -LiteralPath $Source) {
    Get-ChildItem -LiteralPath $Source -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    cmd /c "rmdir `"$Source`"" | Out-Null
  }

  if (Test-Path -LiteralPath $Source) {
    throw "Nao consegui remover a pasta original: $Source"
  }

  cmd /c "mklink /J `"$Source`" `"$Dest`""
  if ($LASTEXITCODE -ne 0) {
    throw "mklink /J falhou para $Source -> $Dest"
  }

  Write-Host "   junction ok." -ForegroundColor Green
}

if (-not (Test-Path -LiteralPath "D:\")) {
  throw "O drive D: nao esta disponivel."
}

if (Test-CursorRunning) {
  Write-Host "Feche o Cursor por completo (File > Exit e icone da bandeja) e rode de novo." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Mover Cursor para $DestRoot" -ForegroundColor Cyan
Write-Host "Isso NAO apaga chats: so muda o disco fisico. O Cursor continua vendo os mesmos caminhos."
Write-Host "Nao desligue o PC no meio da copia."
Write-Host ""

$moves = @(
  @{
    Label  = "Roaming (chats, settings, globalStorage)"
    Source = Join-Path $env:APPDATA "Cursor"
    Dest   = Join-Path $DestRoot "Roaming-Cursor"
  }
  @{
    Label  = "Local (cache e updates)"
    Source = Join-Path $env:LOCALAPPDATA "Cursor"
    Dest   = Join-Path $DestRoot "Local-Cursor"
  }
  @{
    Label  = ".cursor (agentes e projetos)"
    Source = Join-Path $env:USERPROFILE ".cursor"
    Dest   = Join-Path $DestRoot "Dot-Cursor"
  }
)

foreach ($m in $moves) {
  Move-WithJunction -Source $m.Source -Dest $m.Dest -Label $m.Label
}

Write-Host ""
Write-Host "Concluido. Abra o Cursor e confira se settings e chats ainda estao la." -ForegroundColor Green
Write-Host "Se algo falhar: as pastas reais ficam em $DestRoot"
Write-Host ""
