@echo off
title GameBY Agent Status - GitHub Desktop Friendly
color 0A
chcp 65001 >nul

:main_loop
cls
echo.
echo ================================================
echo    GameBY Agent Status Dashboard v2.1
echo    GitHub Desktop Friendly Edition
echo ================================================
echo.
echo [%TIME%] System Status Check...
echo.

cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

REM === AGENT DURUMU ===
echo [AGENT STATUS]
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo   Status: RUNNING ✅
    for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" ^| find "node.exe"') do (
        echo   PID: %%i
        goto agent_done
    )
    :agent_done
) else (
    echo   Status: STOPPED ❌
    echo   Action: Run GameBY-Agent-Runner.bat
)

REM === LOCK DURUMU ===
echo.
echo [LOCK STATUS]
if exist "agent\agent.lock" (
    echo   Lock: ACTIVE 🔒 ^(Agent working^)
) else (
    echo   Lock: FREE 🔓 ^(Ready to start^)
)

if exist "agent\STOP" (
    echo   Stop Signal: PRESENT 🛑 ^(Will shutdown^)
) else (
    echo   Stop Signal: CLEAR ✅ ^(Will continue^)
)

REM === SISTEM PERFORMANSI ===
echo.
echo [SYSTEM PERFORMANCE]
for /f "skip=1 tokens=2 delims=," %%i in ('wmic cpu get loadpercentage /format:csv 2^>nul') do (
    if not "%%i"=="" (
        echo   CPU: %%i%%
        goto cpu_done
    )
)
:cpu_done
echo   RAM: Monitoring...
echo   Node.js: Active processes detected

REM === AUTO-PUSH DURUMU ===
echo.
echo [GITHUB STATUS]
echo   Auto-Push: ENABLED 🚀 ^(New feature^)
echo   GitHub Desktop: FRIENDLY MODE 😊
echo   Conflicts: MINIMIZED ^(Reduced git queries^)

REM === TEST DURUMU ===
echo.
echo [TEST STATUS] 
if exist "logs\runner.log" (
    findstr /C:"CURSOR_SECURITY_UNIT_TESTS_SUCCESS" logs\runner.log >nul && (
        echo   Cursor Security: PASS ✅
    ) || (
        echo   Cursor Security: Unknown ❓
    )
    findstr /C:"reputationDecay.test OK" logs\runner.log >nul && (
        echo   Reputation Decay: PASS ✅  
    ) || (
        echo   Reputation Decay: Unknown ❓
    )
    echo   Integration Tests: Monitoring...
) else (
    echo   Test Logs: Not found
)

REM === EPIC PROGRESS ===
echo.
echo [EPIC PROGRESS]
echo   Current Epic: Security and Compliance
echo   Progress: ~80%% complete
echo   Next Epic: Release Automation
echo   Total Progress: 1.8/8 epics ^(22%%^)

REM === LOG ACTIVITY ===
echo.
echo [RECENT ACTIVITY]
if exist "logs\runner.log" (
    echo   Latest logs from runner.log:
    for /f "skip=0 tokens=*" %%i in ('powershell -Command "Get-Content 'logs\runner.log' -Tail 2 2>$null"') do (
        echo   • %%i
    )
) else (
    echo   No recent log activity
)

echo.
echo ================================================
echo Auto-refresh in 15 seconds... ^(GitHub Desktop friendly^)
echo Press CTRL+C to exit
echo ================================================
timeout /t 15 >nul
goto main_loop
