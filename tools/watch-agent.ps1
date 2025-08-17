# Agent İzleme Dashboard
# Kullanım: .\watch-agent.ps1

Clear-Host
Write-Host "🤖 Agent Runner Dashboard" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Sürekli döngü
while ($true) {
    Clear-Host
    Write-Host "🤖 Agent Runner Dashboard - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    
    # 1. Son commit'ler
    Write-Host "📝 Son Commit'ler:" -ForegroundColor Yellow
    git log --oneline -5
    Write-Host ""
    
    # 2. Tasks durumu
    Write-Host "✅ Tamamlanan Görevler:" -ForegroundColor Yellow
    $doneTasks = (Get-Content "tools\tasks.json" | Select-String '"done":\s*true').Count
    $totalTasks = (Get-Content "tools\tasks.json" | Select-String '"id":').Count
    Write-Host "  $doneTasks / $totalTasks görev tamamlandı"
    Write-Host ""
    
    # 3. Runner durumu
    Write-Host "🔄 Runner Durumu:" -ForegroundColor Yellow
    $runnerProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"}
    if ($runnerProcess) {
        Write-Host "  ✅ Çalışıyor (PID: $($runnerProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Çalışmıyor" -ForegroundColor Red
    }
    Write-Host ""
    
    # 4. Son log satırları
    Write-Host "📜 Son Log Satırları:" -ForegroundColor Yellow
    if (Test-Path "logs\runner.log") {
        Get-Content "logs\runner.log" -Tail 5 | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "  Log dosyası bulunamadı"
    }
    Write-Host ""
    
    # 5. Next Actions
    Write-Host "🎯 Next Actions:" -ForegroundColor Yellow
    if (Test-Path "docs\status.md") {
        $nextActions = Get-Content "docs\status.md" | Select-String -A 10 "Next Actions"
        if ($nextActions) {
            $nextActions[0..5] | ForEach-Object { Write-Host "  $_" }
        }
    }
    
    Write-Host ""
    Write-Host "Press Ctrl+C to exit" -ForegroundColor Gray
    
    # 10 saniye bekle
    Start-Sleep -Seconds 10
}
