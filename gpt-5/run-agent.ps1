# Helper to run GPT-5 Ops Agent with one command
param(
  [string]$Goal = "Nginx kur, /var/www/hello için site ayarla, 80/443 aç, nginx -t ve restart",
  [switch]$DryRun,
  [switch]$Agent
)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  if (-not (Get-Command pwsh -ErrorAction SilentlyContinue)) {
    Write-Host "PowerShell 7 (pwsh) bulunamadı. Windows PowerShell ile denenecek." -ForegroundColor Yellow
  }
  $cfgPath = Join-Path $PSScriptRoot 'config.json'
  if (-not (Test-Path $cfgPath)) { throw "config.json bulunamadı: $cfgPath" }

  # Optionally toggle DryRun
  if ($DryRun) {
    $json = Get-Content $cfgPath -Raw | ConvertFrom-Json
    $json.DryRun = $true
    $json | ConvertTo-Json -Depth 10 | Set-Content $cfgPath -Encoding UTF8
  }

  $args = @()
  if ($Agent) { $args += '-Agent' }
  $args += @('-Goal', $Goal, '-Config', './config.json', '-YesAll')
  & pwsh -NoLogo -NoProfile -File './gpt-ops.ps1' @args
} finally { Pop-Location }
