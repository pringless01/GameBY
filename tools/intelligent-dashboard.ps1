#!/usr/bin/env pwsh
# GameBY Intelligent Agent Dashboard
# Real-time monitoring with escalation system

param(
    [int]$RefreshInterval = 3,
    [switch]$Compact,
    [switch]$ShowLogs
)

$HOST.UI.RawUI.WindowTitle = "GameBY Intelligent Agent Dashboard"

# Dashboard ana döngüsü
while ($true) {
    Clear-Host
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "🚀 GameBY INTELLIGENT AGENT DASHBOARD" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "⏰ $timestamp" -ForegroundColor Yellow
    Write-Host ""
    
    # Escalation System Status
    try {
        $escalationStatus = node "c:\Users\Musa\Documents\GitHub\GameBY\tools\escalation-system.js" status 2>$null
        if ($escalationStatus) {
            $status = $escalationStatus | ConvertFrom-Json
            
            Write-Host "🎯 ESCALATION SYSTEM STATUS" -ForegroundColor Cyan
            Write-Host "Current Tier: " -NoNewline
            
            switch ($status.currentTier) {
                1 { Write-Host "Tier 1 (GPT-4o-mini)" -ForegroundColor Green }
                2 { Write-Host "Tier 2 (GPT-4o)" -ForegroundColor Yellow }
                3 { Write-Host "Tier 3 (GPT-4)" -ForegroundColor Orange }
                4 { Write-Host "Tier 4 (GPT-5)" -ForegroundColor Red }
                5 { Write-Host "Tier 5 (GPT-5 THINKING MODE)" -ForegroundColor Magenta }
            }
            
            Write-Host "Model: $($status.currentModel.name) ($($status.currentModel.capability))" -ForegroundColor White
            Write-Host "Thinking Mode: " -NoNewline
            if ($status.currentModel.thinking) {
                Write-Host "ACTIVE 🧠" -ForegroundColor Magenta
            } else {
                Write-Host "Inactive" -ForegroundColor Gray
            }
            
            Write-Host ""
            Write-Host "📊 STATISTICS:" -ForegroundColor Cyan
            Write-Host "  Total Requests: $($status.stats.totalRequests)"
            Write-Host "  Escalations: $($status.stats.escalations)"
            Write-Host "  Thinking Mode Usage: $($status.stats.thinkingModeUsage)"
            Write-Host "  Cost Saved: $($status.stats.costSaved)x units"
            
            if ($status.costEfficiency) {
                Write-Host "  Average Tier Used: $($status.costEfficiency.avgTierUsed)"
                Write-Host "  Cost Efficiency: $($status.costEfficiency.efficiency)" -ForegroundColor Green
            }
            
            if ($status.recommendations -and $status.recommendations.Count -gt 0) {
                Write-Host ""
                Write-Host "💡 RECOMMENDATIONS:" -ForegroundColor Yellow
                foreach ($rec in $status.recommendations) {
                    Write-Host "  • $rec" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        Write-Host "❌ Escalation system status unavailable" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔄 AGENT RUNNER STATUS" -ForegroundColor Cyan
    
    # Runner process kontrolü
    $runnerProcess = Get-Process | Where-Object {
        $_.ProcessName -eq "node" -and 
        ($_.CommandLine -like "*intelligent-runner*" -or $_.CommandLine -like "*codex-runner*")
    } | Select-Object -First 1
    
    if ($runnerProcess) {
        $uptime = (Get-Date) - $runnerProcess.StartTime
        Write-Host "Status: " -NoNewline
        Write-Host "RUNNING 🟢" -ForegroundColor Green
        Write-Host "PID: $($runnerProcess.Id)"
        Write-Host "Uptime: $($uptime.ToString('hh\:mm\:ss'))"
        Write-Host "Memory: $([math]::Round($runnerProcess.WorkingSet / 1MB, 2)) MB"
    } else {
        Write-Host "Status: " -NoNewline
        Write-Host "STOPPED 🔴" -ForegroundColor Red
    }
    
    # Log dosyası kontrolü
    $logFile = "c:\Users\Musa\Documents\GitHub\GameBY\logs\intelligent-runner.log"
    if (Test-Path $logFile) {
        $logStats = Get-Content $logFile | Measure-Object -Line
        $lastLog = Get-Content $logFile | Select-Object -Last 1
        
        Write-Host ""
        Write-Host "📝 LOG STATUS" -ForegroundColor Cyan
        Write-Host "Total log entries: $($logStats.Lines)"
        
        if ($lastLog) {
            try {
                $lastEntry = $lastLog | ConvertFrom-Json
                Write-Host "Last activity: $($lastEntry.action) at $($lastEntry.timestamp)"
            } catch {
                Write-Host "Last activity: $($lastLog.Substring(0, [Math]::Min(50, $lastLog.Length)))..."
            }
        }
    }
    
    # Escalation log kontrolü  
    $escalationLogFile = "c:\Users\Musa\Documents\GitHub\GameBY\logs\escalation-log.json"
    if (Test-Path $escalationLogFile) {
        try {
            $escalationLog = Get-Content $escalationLogFile | ConvertFrom-Json
            
            Write-Host ""
            Write-Host "📈 RECENT ESCALATIONS" -ForegroundColor Cyan
            
            $recentLogs = $escalationLog.escalationLog | Select-Object -Last 3
            foreach ($log in $recentLogs) {
                $time = [DateTime]::Parse($log.timestamp).ToString("HH:mm:ss")
                
                if ($log.action -eq "thinking_mode_activated") {
                    Write-Host "  ${time}: 🧠 Thinking Mode Activated" -ForegroundColor Magenta
                } elseif ($log.action -eq "deescalation") {
                    Write-Host "  ${time}: ⬇️ $($log.from.name) → $($log.to.name)" -ForegroundColor Green
                } elseif ($log.to -and $log.from) {
                    Write-Host "  ${time}: ⬆️ $($log.from.name) → $($log.to.name)" -ForegroundColor Red
                    if ($log.reasons) {
                        Write-Host "    Reasons: $($log.reasons -join ', ')" -ForegroundColor Gray
                    }
                }
            }
        } catch {
            Write-Host "❌ Could not parse escalation log" -ForegroundColor Red
        }
    }
    
    # Git durumu
    Write-Host ""
    Write-Host "📦 GIT STATUS" -ForegroundColor Cyan
    
    try {
        Push-Location "c:\Users\Musa\Documents\GitHub\GameBY"
        
        $gitStatus = git status --porcelain 2>$null
        $ahead = git rev-list --count HEAD ^origin/feat/memory-system 2>$null
        $branch = git branch --show-current 2>$null
        $lastCommit = git log -1 --format="%h %s" 2>$null
        
        Write-Host "Branch: $branch"
        if ($ahead -and $ahead -gt 0) {
            Write-Host "Ahead: $ahead commits" -ForegroundColor Yellow
        }
        Write-Host "Last commit: $lastCommit"
        
        if ($gitStatus) {
            $changes = ($gitStatus | Measure-Object).Count
            Write-Host "Uncommitted changes: $changes files" -ForegroundColor Orange
        } else {
            Write-Host "Working tree: Clean ✅" -ForegroundColor Green
        }
        
        Pop-Location
    } catch {
        Write-Host "❌ Git status unavailable" -ForegroundColor Red
    }
    
    # Sistem kaynakları
    if (-not $Compact) {
        Write-Host ""
        Write-Host "💻 SYSTEM RESOURCES" -ForegroundColor Cyan
        
        $cpu = Get-Counter -Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 1
        $cpuUsage = [math]::Round($cpu.CounterSamples[0].CookedValue, 1)
        
        $memory = Get-Counter -Counter "\Memory\Available MBytes"
        $totalMemory = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB
        $availableMemory = $memory.CounterSamples[0].CookedValue
        $usedMemory = $totalMemory - $availableMemory
        $memoryUsage = [math]::Round(($usedMemory / $totalMemory) * 100, 1)
        
        Write-Host "CPU Usage: $cpuUsage%"
        Write-Host "Memory Usage: $memoryUsage% (" -NoNewline
        Write-Host "$([math]::Round($usedMemory, 0)) / $([math]::Round($totalMemory, 0)) MB)" -NoNewline
        Write-Host ""
        
        # Disk kontrolü
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
        $diskFree = [math]::Round($disk.FreeSpace / 1GB, 1)
        $diskTotal = [math]::Round($disk.Size / 1GB, 1)
        $diskUsed = $diskTotal - $diskFree
        $diskUsage = [math]::Round(($diskUsed / $diskTotal) * 100, 1)
        
        Write-Host "Disk Usage: $diskUsage% (" -NoNewline
        Write-Host "$diskUsed / $diskTotal GB)" -NoNewline
        Write-Host ""
    }
    
    # Log görüntüleme
    if ($ShowLogs -and (Test-Path $logFile)) {
        Write-Host ""
        Write-Host "📄 RECENT LOGS" -ForegroundColor Cyan
        Write-Host "-" * 60
        
        $recentLogs = Get-Content $logFile | Select-Object -Last 5
        foreach ($log in $recentLogs) {
            try {
                $entry = $log | ConvertFrom-Json
                $time = [DateTime]::Parse($entry.timestamp).ToString("HH:mm:ss")
                Write-Host "[$time] $($entry.action)" -ForegroundColor White
                
                if ($entry.escalation -and $entry.escalation.escalated) {
                    Write-Host "  → Escalated to Tier $($entry.escalation.currentTier)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "$log" -ForegroundColor Gray
            }
        }
    }
    
    # Kontrol komutları
    Write-Host ""
    Write-Host "🎮 CONTROLS" -ForegroundColor Cyan
    Write-Host "Ctrl+C: Exit Dashboard"
    Write-Host "Commands available:"
    Write-Host "  node tools/intelligent-runner.js start     - Start intelligent runner"
    Write-Host "  node tools/intelligent-runner.js status    - Check status"
    Write-Host "  node tools/escalation-system.js thinking   - Activate thinking mode"
    Write-Host "  node tools/escalation-system.js deescalate - Step down tier"
    
    # Refresh countdown
    Write-Host ""
    Write-Host "Refreshing in $RefreshInterval seconds..." -ForegroundColor Gray
    
    Start-Sleep -Seconds $RefreshInterval
}
