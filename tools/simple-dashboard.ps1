#!/usr/bin/env pwsh
# Simple GameBY Intelligent Agent Dashboard

param([int]$RefreshInterval = 3)

$HOST.UI.RawUI.WindowTitle = "GameBY Intelligent Agent Dashboard"

while ($true) {
    Clear-Host
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "🚀 GAMEBY INTELLIGENT AGENT DASHBOARD" -ForegroundColor Green
    Write-Host "=" * 50 -ForegroundColor Gray
    Write-Host "⏰ $timestamp" -ForegroundColor Yellow
    Write-Host ""
    
    # Escalation System Status
    Write-Host "🎯 ESCALATION SYSTEM STATUS" -ForegroundColor Cyan
    try {
        $escalationData = node "c:\Users\Musa\Documents\GitHub\GameBY\tools\escalation-system.cjs" status 2>$null
        if ($escalationData) {
            $status = $escalationData | ConvertFrom-Json
            
            Write-Host "Current Tier: $($status.currentTier)/5"
            Write-Host "Model: $($status.currentModel.name)"
            Write-Host "Capability: $($status.currentModel.capability)"
            Write-Host "Thinking Mode: " -NoNewline
            if ($status.currentModel.thinking) {
                Write-Host "ACTIVE 🧠" -ForegroundColor Magenta
            } else {
                Write-Host "Inactive" -ForegroundColor Gray
            }
            
            Write-Host "Total Requests: $($status.stats.totalRequests)"
            Write-Host "Escalations: $($status.stats.escalations)"
            Write-Host "Thinking Usage: $($status.stats.thinkingModeUsage)"
        }
    } catch {
        Write-Host "❌ Escalation system unavailable" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔄 AGENT RUNNER STATUS" -ForegroundColor Cyan
    
    # Process check
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Node processes running: $($nodeProcesses.Count)" -ForegroundColor Green
        $nodeProcesses | ForEach-Object {
            $uptime = (Get-Date) - $_.StartTime
            Write-Host "  PID $($_.Id): Uptime $($uptime.ToString('hh\:mm\:ss'))"
        }
    } else {
        Write-Host "No agent processes running" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📦 GIT STATUS" -ForegroundColor Cyan
    try {
        Push-Location "c:\Users\Musa\Documents\GitHub\GameBY"
        $branch = git branch --show-current 2>$null
        $ahead = git rev-list --count HEAD ^origin/feat/memory-system 2>$null
        $lastCommit = git log -1 --format="%h %s" 2>$null
        
        Write-Host "Branch: $branch"
        if ($ahead -and $ahead -gt 0) {
            Write-Host "Ahead: $ahead commits" -ForegroundColor Yellow  
        }
        Write-Host "Last: $lastCommit"
        Pop-Location
    } catch {
        Write-Host "❌ Git status unavailable" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎮 CONTROLS" -ForegroundColor Cyan
    Write-Host "Available commands:"
    Write-Host "  node tools/intelligent-runner.cjs start"
    Write-Host "  node tools/escalation-system.cjs thinking"
    Write-Host "  node tools/test-escalation.cjs"
    
    Write-Host ""
    Write-Host "Press Ctrl+C to exit" -ForegroundColor Gray
    Write-Host "Refreshing in $RefreshInterval seconds..." -ForegroundColor Gray
    
    Start-Sleep -Seconds $RefreshInterval
}
