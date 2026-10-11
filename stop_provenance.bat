@echo off
title Provenance Stopper
color 0C

echo ============================================================
echo   PROVENANCE -- Stopping All Services
echo ============================================================
echo.
echo [*] Releasing port 8001 (FastAPI Backend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host '  [OK] Terminated API PID:' $_.OwningProcess } catch {} }"

echo [*] Releasing port 3000 (Next.js Frontend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host '  [OK] Terminated Web PID:' $_.OwningProcess } catch {} }"

echo [*] Closing server windows...
taskkill /FI "WINDOWTITLE eq Provenance API*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Provenance Web*" /F >nul 2>&1

echo.
echo ============================================================
echo   [SUCCESS] Provenance backend and frontend stopped cleanly.
echo   Ports 8001 and 3000 are now free.
echo ============================================================
echo.
ping 127.0.0.1 -n 2 >nul
exit /b 0
