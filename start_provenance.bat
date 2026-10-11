@echo off
title Provenance Launcher
color 0A

echo ============================================================
echo   PROVENANCE -- Evidence-Driven Adaptive Interview Platform
echo   Google Hackathon Track 03: Adaptive Interview Intelligence
echo ============================================================
echo.
echo [*] Checking environment prerequisites...

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] ERROR: Python is not found in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] ERROR: Node.js / npm is not found in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected.
echo.
echo [*] Starting FastAPI Backend on port 8001...
start "Provenance API (Backend - Port 8001)" cmd /c "cd /d "%~dp0" && python -m uvicorn apps.api.main:app --port 8001"

echo [*] Starting Next.js Frontend on port 3000...
start "Provenance Web (Frontend - Port 3000)" cmd /c "cd /d "%~dp0apps\web" && npm run start"

echo.
echo [*] Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo [*] Opening Provenance in your default browser...
start http://localhost:3000

echo.
echo ============================================================
echo   PROVENANCE IS NOW RUNNING!
echo ============================================================
echo   - Home & Launchpad:       http://localhost:3000
echo   - Custom AI Mock Session: http://localhost:3000/interview/start
echo   - Preconfigured Room:     http://localhost:3000/interview/INT-901
echo   - Recruiter Workspace:    http://localhost:3000/recruiter
echo   - API Documentation:      http://127.0.0.1:8001/docs
echo.
echo   To stop all services at any time, simply double-click:
echo   stop_provenance.bat (or stop.bat)
echo ============================================================
echo.
pause
