@echo off
cd backend
echo Installing backend dependencies...
call npm install
echo Installing additional required packages...
call npm install bcryptjs jsonwebtoken better-sqlite3
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.
echo Starting backend server...
node index.js
if errorlevel 1 (
    echo ERROR: Server crashed!
    pause
    exit /b 1
)
pause
