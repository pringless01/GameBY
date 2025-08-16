# GameBY Agent Monitor Dashboard
# Real-time monitoring of agent activity

Write-Host "🚀 GameBY Agent Monitor Dashboard" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "CTRL+C ile çıkış yapabilirsiniz" -ForegroundColor Gray
Write-Host ""

while ($true) {
    Clear-Host
    Write-Host "🚀 GameBY Agent Monitor - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    
    # 1. Son commit'ler
    Write-Host "📝 Son Commit'ler:" -ForegroundColor Yellow
    git log --oneline -5
    Write-Host ""
    
    # 2. Tasks durumu
    Write-Host "✅ Tamamlanan Görevler:" -ForegroundColor Yellow
    if (Test-Path "tools\tasks.json") {
        $content = Get-Content "tools\tasks.json" -Raw
        $doneTasks = ([regex]::Matches($content, '"done":\s*true')).Count
        $totalTasks = ([regex]::Matches($content, '"id":')).Count
        Write-Host "  $doneTasks / $totalTasks görev tamamlandı"
    } else {
        Write-Host "  tasks.json bulunamadı"
    }
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
    
    # 4. Log tail (son 5 satır)
    Write-Host "📋 Son Log Kayıtları:" -ForegroundColor Yellow
    if (Test-Path "logs\runner.log") {
        Get-Content "logs\runner.log" | Select-Object -Last 5 | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "  runner.log bulunamadı" -ForegroundColor Gray
    }
    Write-Host ""
    
    # 5. Status dosyası son güncellenme
    Write-Host "📊 Status Son Güncelleme:" -ForegroundColor Yellow
    if (Test-Path "docs\status.md") {
        $statusFile = Get-Item "docs\status.md"
        $timeStr = $statusFile.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        Write-Host "  $timeStr" -ForegroundColor Cyan
    } else {
        Write-Host "  status.md bulunamadı" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "⏰ Sonraki güncelleme: 10 saniye..." -ForegroundColor Green
    Start-Sleep -Seconds 10
}
