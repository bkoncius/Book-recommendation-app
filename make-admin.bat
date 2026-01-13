@echo off
cd backend
echo Making first user admin...
node makeAdmin.js
echo.
echo Done! Now restart the backend server.
pause
