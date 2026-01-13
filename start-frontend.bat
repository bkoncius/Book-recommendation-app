@echo off
cd frontend
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.
echo Starting frontend server...
call npm run dev
if errorlevel 1 (
    echo ERROR: Server crashed!
    pause
    exit /b 1
)
pause
