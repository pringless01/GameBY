# GameBY Agent Alias Installer
# Bu script GameBY agent'ını her yerden çalıştırabilmek için alias oluşturur

Write-Host "🎯 GameBY Agent Alias Kurulum" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Gray

$profilePath = $PROFILE
$aliasCommand = 'function gameby-agent { & "C:\Users\Musa\Documents\GitHub\GameBY\run-agent-standalone.ps1" $args }'

# Profile dosyası var mı kontrol et
if (!(Test-Path $profilePath)) {
    Write-Host "📝 PowerShell profile oluşturuluyor..." -ForegroundColor Yellow
    New-Item -Path $profilePath -Type File -Force | Out-Null
}

# Alias zaten var mı kontrol et
$profileContent = Get-Content $profilePath -ErrorAction SilentlyContinue
if ($profileContent -notcontains $aliasCommand) {
    Write-Host "➕ Alias ekleniyor..." -ForegroundColor Cyan
    Add-Content -Path $profilePath -Value ""
    Add-Content -Path $profilePath -Value "# GameBY Agent Alias"
    Add-Content -Path $profilePath -Value $aliasCommand
    Write-Host "✅ Alias başarıyla eklendi!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Alias zaten mevcut!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Kurulum tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "Kullanım:" -ForegroundColor Cyan
Write-Host "  gameby-agent start    - Agent başlat" -ForegroundColor White
Write-Host "  gameby-agent status   - Durum raporu" -ForegroundColor White
Write-Host "  gameby-agent stop     - Agent durdur" -ForegroundColor White
Write-Host "  gameby-agent restart  - Yeniden başlat" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Yeni PowerShell oturumu açman gerekiyor!" -ForegroundColor Yellow
Write-Host "   Veya: . `$PROFILE" -ForegroundColor Gray
