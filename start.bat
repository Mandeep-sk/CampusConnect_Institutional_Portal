@echo off
TITLE CampusConnect - Institutional Event ^& Notice Board
COLOR 0B
echo =========================================================================
echo               Starting CampusConnect (MERN Stack Portal)
echo =========================================================================
echo.
echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo [INFO] First-time setup detected. Running setup.bat...
    call setup.bat
    goto RUN
)
if not exist "server\node_modules\" (
    echo [INFO] Server dependencies missing. Installing...
    call npm install --prefix server
)
if not exist "client\node_modules\" (
    echo [INFO] Client dependencies missing. Installing...
    call npm install --prefix client
)

:RUN
echo.
echo [2/3] Launching Backend Server (Port 5000) ^& Frontend Vite (Port 5173)...
echo [3/3] Client will be available at: http://localhost:5173
echo.
echo Press Ctrl+C in this terminal window anytime to stop the application.
echo =========================================================================
echo.
npm run dev
pause
