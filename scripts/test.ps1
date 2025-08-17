Write-Host "[test] Unit smoke başlatılıyor (cursor-security)..."
$ErrorActionPreference = "Stop"
# Hızlı unit smoke: cursor security
npm --prefix apps/api/src run test:unit:cursor-security
if ($LASTEXITCODE -ne 0) { throw "Unit smoke başarısız" }

# Opsiyonel: coverage üret ve logs'a kopyala
try {
  Write-Host "[test] Coverage (full) alınıyor..."
  npm --prefix apps/api/src run coverage:full
} catch {
  Write-Warning "Coverage alınamadı: $($_.Exception.Message)"
}

Write-Host "[test] Tamamlandı."
