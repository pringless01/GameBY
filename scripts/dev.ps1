param(
  [switch]$Watch
)

Write-Host "[dev] Backend (apps/api/src) başlatılıyor..."
$env:NODE_ENV = "development"
if ($Watch) {
  npm --prefix apps/api/src run dev
} else {
  npm --prefix apps/api/src run start
}
