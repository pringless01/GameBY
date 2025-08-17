# 🤖 GameBY Agent Standalone Runner
# Bu script VS Code'a bağımlı olmaksızın agent'ı çalıştırır
# Kullanım: .\run-agent-standalone.ps1 [start|stop|restart|status]

param(
    [string]$Action = "start"
)

# Renkli çıktı fonksiyonları
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warning($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Title($msg) { 
    Write-Host ""
    Write-Host "[AGENT] $msg" -ForegroundColor Magenta
    Write-Host ("=" * ($msg.Length + 8)) -ForegroundColor Gray
}

# Ana çalışma dizini
$GameBYPath = "C:\Users\Musa\Documents\GitHub\GameBY"
Set-Location $GameBYPath

function Get-AgentStatus {
    Write-Title "Agent Durumu Kontrol Ediliyor"
    
    # Node.js işlemlerini kontrol et
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        Write-Success "Agent runner calisiyor (PID: $($nodeProcesses.Id -join ', '))"
        
        # Son log dosyasını kontrol et
        $logPath = Join-Path $GameBYPath "logs\runner.log"
        if (Test-Path $logPath) {
            $lastLines = Get-Content $logPath -Tail 5 -ErrorAction SilentlyContinue
            if ($lastLines) {
                Write-Info "Son log kayıtları:"
                $lastLines | ForEach-Object { Write-Host "    $_" -ForegroundColor White }
            }
        }
        return $true
    } else {
        Write-Warning "Agent runner calisiyor degil"
        return $false
    }
}

function Clean-LockFiles {
    Write-Info "Lock dosyalari temizleniyor..."
    
    $lockFiles = @(
        "agent\STOP",
        "agent\agent.lock", 
        "tools\agent-runner\agent.lock"
    )
    
    foreach ($lockFile in $lockFiles) {
        $fullPath = Join-Path $GameBYPath $lockFile
        if (Test-Path $fullPath) {
            Remove-Item $fullPath -Force
            Write-Info "Silindi: $lockFile"
        }
    }
    Write-Success "Lock dosyalari temizlendi"
}

function Start-Agent {
    Write-Title "GameBY Agent Baslatiliyor"
    
    # Lock dosyalarını temizle
    Clean-LockFiles
    
    # Agent zaten çalışıyor mu kontrol et
    if (Get-AgentStatus) {
        Write-Warning "Agent zaten calisiyor! Restart icin 'restart' parametresini kullan."
        return
    }
    
    Write-Info "Agent runner baslatiliyor..."
    
    # Agent'ı arka planda başlat
    $job = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        npm run agent:loop 2>&1 | Tee-Object -FilePath "logs\runner.log" -Append
    } -ArgumentList $GameBYPath
    
    # Kısa bir süre bekle ve durumu kontrol et
    Start-Sleep -Seconds 5
    
    if (Get-AgentStatus) {
        Write-Success "Agent basariyla baslatildi! (Job ID: $($job.Id))"
        Write-Info "Agent gece boyunca calismaya devam edecek..."
        Write-Info "Durumu kontrol etmek icin: .\run-agent-standalone.ps1 status"
        Write-Info "Durdurmak icin: .\run-agent-standalone.ps1 stop"
    } else {
        Write-Error "Agent baslatilamadi!"
        Write-Info "Job ciktisini kontrol ediyor..."
        Receive-Job $job -ErrorAction SilentlyContinue
    }
}

function Stop-Agent {
    Write-Title "Agent Durduruluyor"
    
    # STOP dosyası oluştur
    $stopFile = Join-Path $GameBYPath "agent\STOP"
    New-Item -Path $stopFile -ItemType File -Force | Out-Null
    Write-Info "STOP sinyali gonderildi"
    
    # Node işlemlerini bul ve durdur
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Info "Node islemleri durduruluyor..."
        $nodeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
    
    # PowerShell job'ları durdur
    Get-Job | Where-Object { $_.State -eq "Running" } | Stop-Job
    Get-Job | Remove-Job -Force
    
    # Lock dosyalarını temizle
    Clean-LockFiles
    
    if (-not (Get-Process -Name "node" -ErrorAction SilentlyContinue)) {
        Write-Success "Agent basariyla durduruldu"
    } else {
        Write-Error "Bazi islemler hala calisiyor olabilir"
    }
}

function Restart-Agent {
    Write-Title "Agent Yeniden Baslatiliyor"
    Stop-Agent
    Start-Sleep -Seconds 3
    Start-Agent
}

function Show-Status {
    Write-Title "GameBY Agent Durum Raporu"
    
    # Agent durumu
    $isRunning = Get-AgentStatus
    
    # Git durumu
    Write-Info "Git durumu kontrol ediliyor..."
    $gitStatus = git status --porcelain
    $gitBranch = git branch --show-current
    $commitCount = git rev-list --count HEAD ^origin/$gitBranch 2>$null
    
    Write-Host ""
    Write-Host "GENEL DURUM:" -ForegroundColor Cyan
    Write-Host "    Branch: $gitBranch" -ForegroundColor White
    if ($commitCount) {
        Write-Host "    Ahead: $commitCount commits" -ForegroundColor White
    }
    if ($gitStatus) {
        Write-Host "    Degisiklikler: $($gitStatus.Count) dosya" -ForegroundColor White
    } else {
        Write-Host "    Working tree: temiz" -ForegroundColor White
    }
    
    # Son 5 commit
    Write-Host ""
    Write-Host "📝 SON COMMTLER:" -ForegroundColor Cyan
    git log --oneline -5 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor White
    }
    
    # Sistem kaynakları
    Write-Host ""
    Write-Host "💻 SİSTEM:" -ForegroundColor Cyan
    $mem = Get-CimInstance -ClassName Win32_OperatingSystem
    $memUsage = [math]::Round(($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / $mem.TotalVisibleMemorySize * 100, 1)
    Write-Host "    RAM kullanımı: $memUsage%" -ForegroundColor White
    Write-Host "    Tarih/Saat: $(Get-Date)" -ForegroundColor White
    
    if ($isRunning) {
        Write-Host ""
        Write-Success "Agent aktif çalışıyor! 🚀"
        Write-Host "    Gece boyunca otomatik çalışmaya devam edecek..." -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Warning "Agent durmuş. Başlatmak için: .\run-agent-standalone.ps1 start"
    }
}

# Ana logic
switch ($Action.ToLower()) {
    "start" { Start-Agent }
    "stop" { Stop-Agent }
    "restart" { Restart-Agent }
    "status" { Show-Status }
    default { 
        Write-Host "Kullanım: .\run-agent-standalone.ps1 [start|stop|restart|status]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Komutlar:" -ForegroundColor Cyan
        Write-Host "  start   - Agent'ı başlat" -ForegroundColor White
        Write-Host "  stop    - Agent'ı durdur" -ForegroundColor White  
        Write-Host "  restart - Agent'ı yeniden başlat" -ForegroundColor White
        Write-Host "  status  - Durum raporu göster" -ForegroundColor White
    }
}
