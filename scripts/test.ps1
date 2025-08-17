param(
  [ValidateSet('unit','integration','all')]
  [string]$Suite = 'unit',
  [switch]$Coverage
)

$ErrorActionPreference = "Stop"

function Run-Unit {
  Write-Host "[test] Unit smoke (cursor-security) çalışıyor..."
  npm --prefix apps/api/src run test:unit:cursor-security
}

function Run-IntegrationSmoke {
  Write-Host "[test] Integration smoke (leaderboard basic) çalışıyor..."
  npm --prefix apps/api/src run test:integration:leaderboard
}

function Run-All {
  Write-Host "[test] Tüm testler (unit+integration) çalışıyor..."
  npm --prefix apps/api/src run test
}

switch ($Suite) {
  'unit' { Run-Unit }
  'integration' { Run-IntegrationSmoke }
  'all' { Run-All }
}

if ($LASTEXITCODE -ne 0) { throw "[test] Testler başarısız (suite=$Suite)" }

if ($Coverage) {
  try {
    Write-Host "[test] Coverage (full) alınıyor..."
    npm --prefix apps/api/src run coverage:full
  } catch {
    Write-Warning "Coverage alınamadı: $($_.Exception.Message)"
  }
}

Write-Host "[test] Tamamlandı (suite=$Suite)."
