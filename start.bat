@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required: https://nodejs.org & pause & goto :eof)
if not exist node_modules (echo Installing... & call npm install)
start "" /min cmd /c "timeout /t 4 >nul & start http://localhost:5173"
call npm run dev
