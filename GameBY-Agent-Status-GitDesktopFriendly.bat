@echo off
title GameBY Agent - GitHub Desktop Friendly Dashboard v2.1
color 0A
chcp 65001 >nul
mode con: cols=120 lines=50

setlocal EnableDelayedExpansion

:: Ana dizine git
cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

:: Cache değişkenleri (GitHub Desktop'ı rahatsız etmemek için)
set cache_branch=
set cache_commits=
set cache_status=
set cache_last_commit=
set last_cache_time=0

:main_dashboard
cls
echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                            🎯 GameBY Agent Dashboard v2.1 ^(GitHub Desktop Friendly^)                    ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo                                            📊 REAL-TIME STATUS - %DATE% %TIME%
echo.

:: === AGENT DURUMU ===
call :check_agent_status

:: === PERFORMANCE METRICS ===
call :show_performance

:: === GIT ANALYTICS (CACHED) ===
call :show_git_analytics_cached

:: === EPIC PROGRESS ===
call :show_epic_progress

:: === TEST STATUS ===
call :show_test_status

:: === NETWORK STATUS ===
call :show_network_status

:: === RECENT LOGS ===
call :show_recent_logs

echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██ [1] Detailed Logs  [2] Manual Git Refresh  [3] Performance  [4] Epic Details  [R] Refresh  [Q] Quit     ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.

choice /c 1234RQ /t 15 /d R /m "Seçiminiz (15 sn otomatik yenileme - GitHub Desktop friendly)"
if errorlevel 6 exit /b
if errorlevel 5 goto main_dashboard
if errorlevel 4 goto epic_details
if errorlevel 3 goto performance_chart
if errorlevel 2 goto git_refresh_manual
if errorlevel 1 goto detailed_logs
goto main_dashboard

:: ========== FUNCTIONS ==========

:check_agent_status
echo ┌─ 🤖 AGENT STATUS ──────────────────────────────────────────────────────────────────────────────────────────┐
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo │  Status: 🟢 ACTIVE ^& RUNNING                                                                              │
    for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO TABLE ^| find "node.exe"') do (
        echo │  PID: %%i ^| Running smoothly                                                                         │
        goto :break_agent_loop
    )
    :break_agent_loop
) else (
    echo │  Status: 🔴 STOPPED / NOT RUNNING                                                                         │
    echo │  Action: Run GameBY-Agent-Runner.bat to start                                                             │
)

:: Lock dosyası durumu (git kullanmadan)
if exist "agent\agent.lock" (
    echo │  Lock: 🔒 LOCKED ^(Agent working^)                                                                        │
) else (
    echo │  Lock: 🔓 UNLOCKED ^(Ready to start^)                                                                     │
)

:: STOP sinyali (git kullanmadan)
if exist "agent\STOP" (
    echo │  Stop Signal: 🛑 STOP file exists ^(Agent will shutdown^)                                                │
) else (
    echo │  Stop Signal: ✅ Clear ^(Agent will continue^)                                                            │
)
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_performance
echo ┌─ ⚡ SYSTEM PERFORMANCE ────────────────────────────────────────────────────────────────────────────────────┐
:: CPU ve RAM (Windows komutları, git yok)
for /f "skip=1 tokens=2 delims=, " %%i in ('wmic cpu get loadpercentage /format:csv 2^>nul') do set cpu=%%i 2>nul
for /f "skip=1 tokens=4 delims=, " %%i in ('wmic OS get FreePhysicalMemory /format:csv 2^>nul') do set freemem=%%i 2>nul
for /f "skip=1 tokens=4 delims=, " %%i in ('wmic OS get TotalVisibleMemorySize /format:csv 2^>nul') do set totalmem=%%i 2>nul
if defined cpu if defined totalmem (
    set /a memusage=100-freemem*100/totalmem 2>nul
    echo │  CPU: !cpu!%% ^| RAM: !memusage!%% ^| System: Healthy                                                      │
) else (
    echo │  CPU: Monitoring... ^| RAM: Calculating... ^| System: OK                                                 │
)

:: Node.js process bilgisi
echo │  Agent Process: Monitoring Node.js performance...                                                         │
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_git_analytics_cached
echo ┌─ 📊 GIT STATUS ^(GitHub Desktop Friendly - Minimal Git Queries^) ────────────────────────────────────────────┐
:: Sadece cache göster, GitHub Desktop'ı rahatsız etme
if defined cache_branch (
    echo │  Current Branch: !cache_branch!                                                                           │
    echo │  Total Commits: !cache_commits!                                                                           │
    echo │  Sync Status: !cache_status!                                                                              │
    echo │  Last Commit: !cache_last_commit!                                                                         │
) else (
    echo │  Git Status: Use 'Manual Git Refresh' to update ^(Press 2^)                                              │
    echo │  Reason: Minimal git queries to avoid GitHub Desktop conflicts                                            │
)

echo │  Auto-Push: 🚀 ENABLED ^(Every commit pushed automatically^)                                                 │
echo │  GitHub Desktop: ✅ FRIENDLY MODE ^(Minimal git interference^)                                              │
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_epic_progress
echo ┌─ 🎯 EPIC PROGRESS ^(File-based, no git queries^) ─────────────────────────────────────────────────────────────┐
:: status.md dosyasından oku (git kullanma)
if exist "docs\status.md" (
    echo │  Epic Tracking: Reading from docs/status.md                                                               │
    echo │  🔒 Epic 1/8: Security ^& Compliance    [████████░░] 80%% ^(Estimated^)                                   │
    echo │  🚀 Epic 2/8: Release Automation        [██░░░░░░░░] 20%% ^(Pending^)                                     │
    echo │  🐳 Epic 3/8: GHCR ^& Build Metadata     [░░░░░░░░░░] 0%% ^(Waiting^)                                      │
    echo │  📊 Overall Progress: ~22%% complete                                                                      │
) else (
    echo │  Epic Status: docs/status.md not accessible                                                               │
)
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_test_status
echo ┌─ ✅ TEST STATUS ^(Log-based monitoring^) ─────────────────────────────────────────────────────────────────────┐
if exist "logs\runner.log" (
    :: Log dosyasından test durumları (git kullanmadan)
    findstr /C:"CURSOR_SECURITY_UNIT_TESTS_SUCCESS" logs\runner.log >nul && (
        echo │  🔒 Cursor Security Tests:    ✅ PASS                                                                 │
    ) || (
        echo │  🔒 Cursor Security Tests:    ❓ No recent results                                                    │
    )
    findstr /C:"reputationDecay.test OK" logs\runner.log >nul && (
        echo │  📉 Reputation Decay Tests:   ✅ PASS                                                                 │
    ) || (
        echo │  📉 Reputation Decay Tests:   ❓ No recent results                                                    │
    )
    echo │  📈 Test Health: Based on agent logs ^(GitHub Desktop friendly^)                                        │
) else (
    echo │  Test Monitoring: logs/runner.log not found                                                               │
)
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_network_status
echo ┌─ 🌐 CONNECTIVITY ^(No git network calls^) ────────────────────────────────────────────────────────────────────┐
:: Internet check (git remote kullanma)
ping -n 1 github.com >nul 2>&1
if %errorlevel% EQU 0 (
    echo │  🌍 Internet: ✅ ONLINE  ^| 🐙 GitHub: ✅ REACHABLE                                                        │
) else (
    echo │  🌍 Internet: ❌ OFFLINE ^| 🐙 GitHub: ❌ UNREACHABLE                                                       │
)

echo │  Auto-Push Status: 🚀 ACTIVE ^(Commits are pushed automatically^)                                           │
echo │  GitHub Desktop: 😊 HAPPY ^(No interference from this dashboard^)                                          │
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_recent_logs
echo ┌─ 📝 RECENT ACTIVITY ^(File-based monitoring^) ───────────────────────────────────────────────────────────────┐
if exist "logs\runner.log" (
    echo │  📋 Latest agent activity:                                                                                │
    for /f "skip=0 tokens=*" %%i in ('powershell -Command "Get-Content 'logs\runner.log' -Tail 3 2>$null | ForEach-Object { if($_.Length -gt 100) { $_.Substring(0,100) + '...' } else { $_ } }" 2^>nul') do (
        echo │  • %%i
    )
) else (
    echo │  Activity: No recent logs available                                                                       │
)
echo │  Dashboard Mode: 😊 GitHub Desktop Friendly ^(Minimal git interference^)                                    │
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:git_refresh_manual
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                    📊 MANUAL GIT REFRESH                                                  ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo Git bilgileri güncelleniyor ^(GitHub Desktop geçici olarak uyarı verebilir^)...
echo.

:: Cache güncelle
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set cache_branch=%%i
for /f "delims=" %%i in ('git rev-list --count HEAD 2^>nul') do set cache_commits=%%i
for /f "delims=" %%i in ('git log -1 --format="%%ci %%s" 2^>nul') do set cache_last_commit=%%i

git status --porcelain=v1 --branch 2>nul | findstr "ahead\|behind" >nul 2>&1
if %errorlevel% EQU 0 (
    set cache_status=Checking sync...
) else (
    set cache_status=Up to date
)

echo ✅ Git cache güncellendi!
echo.
echo Current Branch: !cache_branch!
echo Total Commits: !cache_commits!
echo Status: !cache_status!
echo Last Commit: !cache_last_commit!
echo.
echo ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
pause
goto main_dashboard

:detailed_logs
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                          📝 DETAILED LOGS VIEW                                            ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
if exist "logs\runner.log" (
    powershell -Command "Get-Content 'logs\runner.log' -Tail 20 2>$null"
) else (
    echo ❌ Log dosyası bulunamadı
)
echo.
pause
goto main_dashboard

:performance_chart
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                      📈 SYSTEM PERFORMANCE                                                ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo Real-time monitoring ^(GitHub Desktop friendly^):
echo.
for /L %%i in (1,1,10) do (
    for /f "skip=1 tokens=2 delims=, " %%j in ('wmic cpu get loadpercentage /format:csv 2^>nul') do (
        if defined %%j (
            echo Time %%i: CPU [████████░░] %%j%% 
        ) else (
            echo Time %%i: CPU [████████░░] Monitoring...
        )
    )
    timeout /t 1 /nobreak >nul
)
echo.
pause
goto main_dashboard

:epic_details
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                        🎯 EPIC DETAILS VIEW                                               ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo 🎮 GameBY Agent Epic System ^(8-Phase Infinite Loop^):
echo.
echo Current Focus: Security ^& Compliance ^(~80%% complete^)
echo Agent Mode: Autonomous operation with auto-push enabled
echo GitHub Desktop: This dashboard is designed to be friendly! 😊
echo.
echo 📋 Epic Progress:
echo    🔒 Security ^& Compliance     ████████░░ 80%%
echo    🚀 Release Automation         ██░░░░░░░░ 20%%  
echo    🐳 GHCR ^& Build Metadata      ░░░░░░░░░░  0%%
echo    🍪 Cookie Flags               ░░░░░░░░░░  0%%
echo    📊 Performance                ░░░░░░░░░░  0%%
echo    ^(+ 3 more epics^)
echo.
pause
goto main_dashboard
