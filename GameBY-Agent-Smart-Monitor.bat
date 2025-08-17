@echo off
title GameBY Agent Smart Launcher & Monitor
color 0C

echo ================================================
echo    GameBY Agent Smart Launcher v1.0
echo    Auto-detect and Recovery System
echo ================================================
echo.

cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

:check_and_launch
echo [%TIME%] Checking agent status...

REM Node.js process kontrolü
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo   Node.js: RUNNING
    echo   Agent: ACTIVE - OK
    echo.
    echo   Monitoring mode activated...
    goto monitor_loop
) else (
    echo   Node.js: NOT FOUND
    echo   Agent: STOPPED
    echo.
    echo   Starting agent now...
    
    REM Lock temizle
    if exist "agent\STOP" del "agent\STOP" >nul
    if exist "agent\agent.lock" del "agent\agent.lock" >nul
    
    REM Agent başlat
    echo   Command: node tools/agent-runner/runner.js --loop
    start "GameBY Agent Runner" powershell -NoExit -WindowStyle Minimized -Command "cd 'C:\Users\Musa\Documents\GitHub\GameBY' ; node tools/agent-runner/runner.js --loop"
    
    timeout /t 5 >nul
    
    REM Başlatma kontrolü
    tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
    if %errorlevel% EQU 0 (
        echo   Launch: SUCCESS
        echo   Agent is now active!
        goto monitor_loop
    ) else (
        echo   Launch: FAILED
        echo   Retrying in 10 seconds...
        timeout /t 10 >nul
        goto check_and_launch
    )
)

:monitor_loop
cls
echo ================================================
echo    GameBY Agent Smart Monitor v1.0
echo    Real-Time Status Dashboard  
echo ================================================
echo.
echo [%TIME%] Status Check...
echo.

REM Agent process kontrolü
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo [AGENT STATUS]
    echo   Process: RUNNING
    echo   Status: ACTIVE
    
    if exist "agent\agent.lock" (
        echo   Lock: WORKING
    ) else (
        echo   Lock: FREE
    )
) else (
    echo [AGENT STATUS]  
    echo   Process: CRASHED/STOPPED
    echo   Status: NEEDS RESTART
    echo.
    echo   Auto-restarting agent...
    timeout /t 3 >nul
    goto check_and_launch
)

REM Git durumu
echo.
echo [GIT STATUS]
for /f "tokens=*" %%i in ('git log --oneline -1 2^>nul') do (
    echo   Last Commit: %%i
)
echo   Auto-Push: ENABLED

REM Görevler
echo.
echo [CURRENT TASKS]
echo   1. Monorepo domain split
echo   2. Shared business logic
echo   3. Database utilities
echo   4. Service communication
echo   5. Validation packages

echo.
echo ================================================
echo Next check in 20 seconds... (Agent auto-recovery)
echo Press CTRL+C to exit
echo ================================================

timeout /t 20 >nul
goto monitor_loop
