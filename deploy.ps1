Param(
  [string]$ProjectRoot = (Resolve-Path ".").Path
)

Write-Host "Starting deploy..." -ForegroundColor Cyan

$env:JWT_SECRET = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "CHANGE_ME_LONG_SECRET_$(Get-Random)" }
$env:CURSOR_SECRET = if ($env:CURSOR_SECRET) { $env:CURSOR_SECRET } else { "CHANGE_ME_LONG_CURSOR_$(Get-Random)" }
if (-not $env:BASIC_AUTH_ENABLED) { $env:BASIC_AUTH_ENABLED = "0" }

Write-Host "Building images..." -ForegroundColor Yellow
& docker compose build
if ($LASTEXITCODE -ne 0) { throw "docker compose build failed" }

Write-Host "Starting stack..." -ForegroundColor Yellow
& docker compose up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

Write-Host "Waiting for health..." -ForegroundColor Yellow
$max=40; $ok=$false
for ($i=0; $i -lt $max; $i++) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing http://localhost:3000/health -TimeoutSec 2
    if ($resp.StatusCode -eq 200) { $ok=$true; break }
  } catch { Start-Sleep -Seconds 1 }
}
if (-not $ok) { throw "API health check failed" }

Write-Host "Waiting for Nginx..." -ForegroundColor Yellow
$ok=$false
for ($i=0; $i -lt $max; $i++) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing http://localhost/health -TimeoutSec 2
    if ($resp.StatusCode -eq 200) { $ok=$true; break }
  } catch { Start-Sleep -Seconds 1 }
}
if (-not $ok) { throw "Nginx health check failed" }

Write-Host "Smoke test..." -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -UseBasicParsing http://localhost:3000/metrics -TimeoutSec 2
  if ($resp.StatusCode -ne 200) { throw "Smoke metrics not 200" }
} catch {
  throw $_
}

try {
  $resp = Invoke-WebRequest -UseBasicParsing http://localhost/ -TimeoutSec 3
  if ($resp.StatusCode -ne 200) { throw "Frontend index not 200" }
} catch {
  throw $_
}

Write-Host "Deploy OK" -ForegroundColor Green
Write-Host "Health: http://localhost:3000/health" -ForegroundColor DarkGreen
Write-Host "Frontend: http://localhost/" -ForegroundColor DarkGreen
