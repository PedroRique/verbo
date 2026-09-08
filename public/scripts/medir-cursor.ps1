#Requires -Version 5.1
<#
.SYNOPSIS
  Mostra quanto disco o Cursor esta usando neste Windows.
#>
$ErrorActionPreference = "Continue"

function Get-Bytes($path) {
  if (-not (Test-Path -LiteralPath $path)) { return $null }
  $item = Get-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
  if ($null -eq $item) { return $null }
  if (-not $item.PSIsContainer) { return [int64]$item.Length }
  $sum = (Get-ChildItem -LiteralPath $path -Force -Recurse -File -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum).Sum
  if ($null -eq $sum) { return [int64]0 }
  return [int64]$sum
}

function Format-GiB([int64]$bytes) {
  return ("{0:N2} GiB" -f ($bytes / 1GB))
}

Write-Host ""
Write-Host "Cursor — uso de disco" -ForegroundColor Cyan
Write-Host ("=" * 60)

$roots = @(
  @{ Label = "Roaming (config, chats, DB)"; Path = Join-Path $env:APPDATA "Cursor" }
  @{ Label = "Local (cache, updates, logs)"; Path = Join-Path $env:LOCALAPPDATA "Cursor" }
  @{ Label = ".cursor (agentes, projetos)"; Path = Join-Path $env:USERPROFILE ".cursor" }
)

$grand = [int64]0
foreach ($root in $roots) {
  $bytes = Get-Bytes $root.Path
  if ($null -eq $bytes) {
    Write-Host ("{0,-34}  (nao existe)" -f $root.Label)
    continue
  }
  $grand += $bytes
  Write-Host ("{0,-34}  {1,12}   {2}" -f $root.Label, (Format-GiB $bytes), $root.Path)
}

Write-Host ("-" * 60)
Write-Host ("{0,-34}  {1,12}" -f "TOTAL", (Format-GiB $grand)) -ForegroundColor Green

$gs = Join-Path $env:APPDATA "Cursor\User\globalStorage"
Write-Host ""
Write-Host "Maiores itens em globalStorage" -ForegroundColor Yellow
Write-Host $gs
Write-Host ("-" * 60)

if (Test-Path -LiteralPath $gs) {
  Get-ChildItem -LiteralPath $gs -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $bytes = Get-Bytes $_.FullName
    [pscustomobject]@{
      Nome = $_.Name
      GiB  = [math]::Round(($bytes / 1GB), 2)
    }
  } | Sort-Object GiB -Descending | Select-Object -First 20 | Format-Table -AutoSize
} else {
  Write-Host "Pasta globalStorage nao encontrada."
}

$cursor = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
if ($cursor) {
  Write-Host "Cursor esta ABERTO ($($cursor.Count) processo(s)). Feche tudo (incluindo a bandeja) antes de limpar ou mover." -ForegroundColor Red
} else {
  Write-Host "Cursor nao esta em execucao. Seguro seguir para limpar ou mover." -ForegroundColor Green
}

Write-Host ""
Write-Host "Proximo: .\limpar-seguro.ps1   ou   .\mover-para-d.ps1"
Write-Host ""
