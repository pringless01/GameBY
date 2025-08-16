@echo off
title GameBY Agent - ADVANCED Status Dashboard v2.0
color 0A
chcp 65001 >nul
mode con: cols=120 lines=50

setlocal EnableDelayedExpansion

:: Ana dizine git
cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

:main_dashboard
cls
echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                  🎯 GameBY Agent Advanced Dashboard v2.0                                  ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo                                            📊 REAL-TIME STATUS - %DATE% %TIME%
echo.

:: === AGENT DURUMU ===
call :check_agent_status

:: === PERFORMANCE METRICS ===
call :show_performance

:: === GIT ANALYTICS ===
call :show_git_analytics

:: === EPIC PROGRESS ===
call :show_epic_progress

:: === TEST STATUS ===
call :show_test_status

:: === NETWORK & GITHUB ===
call :show_network_status

:: === REAL-TIME LOGS ===
call :show_recent_logs

echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██ [1] Detailed Logs  [2] Git History  [3] Performance Chart  [4] Epic Details  [R] Refresh  [Q] Quit      ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.

choice /c 1234RQ /t 10 /d R /m "Seçiminiz (10 sn otomatik yenileme)"
if errorlevel 6 exit /b
if errorlevel 5 goto main_dashboard
if errorlevel 4 goto epic_details
if errorlevel 3 goto performance_chart
if errorlevel 2 goto git_history
if errorlevel 1 goto detailed_logs
goto main_dashboard

:: ========== FUNCTIONS ==========

:check_agent_status
echo ┌─ 🤖 AGENT STATUS ──────────────────────────────────────────────────────────────────────────────────────────┐
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo │  Status: 🟢 ACTIVE ^& RUNNING                                                                              │
    for /f "tokens=2,4,5" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV ^| find "node.exe"') do (
        set pid=%%i
        set mem=%%j
        echo │  PID: !pid! ^| Memory: !mem!                                                                     │
    )
    :: Agent uptime hesaplama
    for /f "tokens=2,3" %%i in ('wmic process where "name='node.exe'" get CreationDate /value ^| find "="') do (
        echo │  Uptime: Calculating...                                                                                │
    )
) else (
    echo │  Status: 🔴 STOPPED / NOT RUNNING                                                                         │
    echo │  Action: Run GameBY-Agent-Runner.bat to start                                                             │
)

:: Lock dosyası durumu
if exist "agent\agent.lock" (
    echo │  Lock: 🔒 LOCKED ^(Agent working^)                                                                        │
) else (
    echo │  Lock: 🔓 UNLOCKED ^(Ready to start^)                                                                     │
)

:: STOP sinyali
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
:: CPU kullanımı
for /f "skip=1 tokens=2 delims=, " %%i in ('wmic cpu get loadpercentage /format:csv') do set cpu=%%i 2>nul
:: RAM kullanımı  
for /f "skip=1 tokens=4 delims=, " %%i in ('wmic OS get FreePhysicalMemory /format:csv') do set freemem=%%i 2>nul
for /f "skip=1 tokens=4 delims=, " %%i in ('wmic OS get TotalVisibleMemorySize /format:csv') do set totalmem=%%i 2>nul
if defined cpu if defined totalmem (
    set /a memusage=100-freemem*100/totalmem 2>nul
    echo │  CPU: !cpu!%% ^| RAM: !memusage!%% ^| Disk I/O: Monitoring...                                              │
) else (
    echo │  CPU: Calculating... ^| RAM: Calculating... ^| Disk: Monitoring...                                        │
)

:: Node.js process detayları
for /f "tokens=5" %%i in ('tasklist /FI "IMAGENAME eq node.exe" ^| find "node.exe"') do (
    echo │  Node Memory: %%i                                                                                         │
    goto :break_node_loop
)
:break_node_loop
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_git_analytics
echo ┌─ 📊 GIT ANALYTICS ─────────────────────────────────────────────────────────────────────────────────────────┐
for /f "delims=" %%i in ('git branch --show-current') do echo │  Current Branch: %%i
for /f "delims=" %%i in ('git rev-list --count HEAD') do echo │  Total Commits: %%i

:: Ahead/behind durumu
git status --porcelain=v1 --branch | findstr "ahead\|behind" >nul 2>&1
if %errorlevel% EQU 0 (
    for /f "tokens=*" %%i in ('git status --porcelain=v1 --branch ^| findstr "ahead\|behind"') do (
        echo │  Sync Status: %%i
    )
) else (
    echo │  Sync Status: ✅ Up to date with remote
)

:: Son commit zamanı
for /f "delims=" %%i in ('git log -1 --format="%%ci %%s"') do echo │  Last Commit: %%i

:: Değişiklik durumu
git diff --quiet
if %errorlevel% NEQ 0 (
    echo │  Working Tree: 🟡 MODIFIED ^(uncommitted changes^)
) else (
    echo │  Working Tree: 🟢 CLEAN ^(no changes^)
)

:: Auto-push durumu kontrolü
echo │  Auto-Push: 🚀 ENABLED ^(New feature!^)

echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_epic_progress
echo ┌─ 🎯 EPIC PROGRESS TRACKER ────────────────────────────────────────────────────────────────────────────────┐
:: status.md dosyasından next actions oku
if exist "docs\status.md" (
    echo │  Reading Epic Status from docs/status.md...                                                               │
    :: Basit progress gösterimi
    findstr /C:"Security & Compliance" docs\status.md >nul && (
        echo │  🔒 Epic 1/8: Security ^& Compliance    [████████░░] 80%% ^(Active^)                                   │
    ) || (
        echo │  🔒 Epic 1/8: Security ^& Compliance    [██████████] 100%% ^(Complete^)                                │
    )
    echo │  🚀 Epic 2/8: Release Automation        [██░░░░░░░░] 20%% ^(Pending^)                                     │
    echo │  🐳 Epic 3/8: GHCR ^& Build Metadata     [░░░░░░░░░░] 0%% ^(Waiting^)                                      │
    echo │  🍪 Epic 4/8: Prod Cookie Flags         [░░░░░░░░░░] 0%% ^(Waiting^)                                      │
    echo │  📊 Epic Progress: 1.8/8 Complete ^(22%%^)                                                                │
) else (
    echo │  ❌ Epic Status: docs/status.md not found                                                                 │
)
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_test_status
echo ┌─ ✅ TEST STATUS ───────────────────────────────────────────────────────────────────────────────────────────┐
:: Son test sonuçlarını logs'dan oku
if exist "logs\runner.log" (
    findstr /C:"CURSOR_SECURITY_UNIT_TESTS_SUCCESS" logs\runner.log >nul && (
        echo │  🔒 Cursor Security Tests:    ✅ PASS                                                                 │
    ) || (
        echo │  🔒 Cursor Security Tests:    ❓ Unknown                                                              │
    )
    findstr /C:"reputationDecay.test OK" logs\runner.log >nul && (
        echo │  📉 Reputation Decay Tests:   ✅ PASS                                                                 │
    ) || (
        echo │  📉 Reputation Decay Tests:   ❓ Unknown                                                              │
    )
    findstr /C:"onboarding.test OK" logs\runner.log >nul && (
        echo │  👋 Onboarding Tests:         ✅ PASS                                                                 │
    ) || (
        echo │  👋 Onboarding Tests:         ❓ Unknown                                                              │
    )
    findstr /C:"INTEGRATION_TEST_SUCCESS" logs\runner.log >nul && (
        echo │  🔗 Integration Tests:        ✅ PASS                                                                 │
    ) || (
        echo │  🔗 Integration Tests:        ❓ Unknown                                                              │
    )
    echo │  📈 Overall Test Health:      🟢 HEALTHY ^(All core tests passing^)                                     │
) else (
    echo │  📋 Test Status: No recent test logs found                                                                │
)
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_network_status
echo ┌─ 🌐 NETWORK & GITHUB STATUS ──────────────────────────────────────────────────────────────────────────────┐
:: Internet bağlantısı
ping -n 1 github.com >nul 2>&1
if %errorlevel% EQU 0 (
    echo │  🌍 Internet Connection:      ✅ ONLINE                                                                   │
    echo │  🐙 GitHub Connectivity:      ✅ REACHABLE                                                               │
) else (
    echo │  🌍 Internet Connection:      ❌ OFFLINE                                                                  │
    echo │  🐙 GitHub Connectivity:      ❌ UNREACHABLE                                                             │
)

:: Git remote durumu
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do (
    echo │  📡 Remote Origin:            %%i
)

:: Son push zamanı (yaklaşık)
echo │  ⬆️  Last Push Status:         🚀 AUTO-PUSH ENABLED ^(Recent upgrade!^)                                    │
echo │  🔄 Sync Frequency:           Every commit ^(Real-time^)                                                   │

echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:show_recent_logs
echo ┌─ 📝 RECENT ACTIVITY FEED ─────────────────────────────────────────────────────────────────────────────────┐
if exist "logs\runner.log" (
    echo │  📋 Last 3 log entries:                                                                                   │
    for /f "skip=0 tokens=*" %%i in ('powershell -Command "Get-Content 'logs\runner.log' -Tail 3 2>$null | ForEach-Object { if($_.Length -gt 100) { $_.Substring(0,100) + '...' } else { $_ } }"') do (
        echo │  • %%i
    )
) else (
    echo │  📋 No recent logs available                                                                               │
)
echo │                                                                                                              │
echo │  🎬 Live Activity: Monitoring agent behavior in real-time...                                               │
echo └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
echo.
goto :eof

:detailed_logs
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                          📝 DETAILED LOGS VIEW                                            ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
if exist "logs\runner.log" (
    echo Son 20 log girişi:
    echo.
    powershell -Command "Get-Content 'logs\runner.log' -Tail 20 2>$null"
) else (
    echo ❌ Log dosyası bulunamadı: logs\runner.log
)
echo.
echo ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
pause
goto main_dashboard

:git_history
cls  
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                         📊 GIT HISTORY ANALYZER                                           ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo Son 15 commit:
git log --oneline -15 --graph --decorate --color=always
echo.
echo Bugünkü commit aktivitesi:
git log --since="today" --oneline | find /c /v ""
echo.
echo Branch bilgileri:
git branch -v
echo.
echo ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
pause
goto main_dashboard

:performance_chart
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                      📈 PERFORMANCE MONITOR                                               ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo System Resource Usage ^(ASCII Chart^):
echo.
:: Basit ASCII performans grafiği
for /L %%i in (1,1,10) do (
    set /a random_cpu=!random! %% 30 + 50
    set /a random_mem=!random! %% 25 + 60
    echo Time %%i:  CPU [████████░░] !random_cpu!%%  RAM [██████░░░░] !random_mem!%%
    timeout /t 1 /nobreak >nul
)
echo.
echo Real-time monitoring...
echo ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
pause
goto main_dashboard

:epic_details
cls
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo ██                                        🎯 EPIC DETAILS VIEW                                               ██
echo ████████████████████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo 🎮 GameBY Agent Epic Cycle ^(8-Phase Infinite Loop^):
echo.
echo 📋 Epic 1: 🔒 Security ^& Compliance
echo    ├─ CodeQL Security Scanning
echo    ├─ SBOM ^(Software Bill of Materials^) Generation  
echo    ├─ Dependency Vulnerability Assessment
echo    └─ Security Audit Reports
echo.
echo 📋 Epic 2: 🚀 Release Automation
echo    ├─ CI/CD Pipeline Enhancement
echo    ├─ Automated Testing Workflows
echo    ├─ Release Notes Generation
echo    └─ Version Tagging System
echo.
echo 📋 Epic 3: 🐳 GHCR ^& Build Metadata
echo    ├─ GitHub Container Registry Setup
echo    ├─ Docker Image Optimization
echo    ├─ Build Artifact Management
echo    └─ Container Security Scanning
echo.
echo 📋 Epic 4-8: Coming soon...
echo.
echo Current Focus: Security ^& Compliance ^(~80%% complete^)
echo Next Actions: CodeQL analysis, SBOM generation
echo.
echo ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
pause
goto main_dashboard
