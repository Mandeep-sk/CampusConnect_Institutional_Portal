@echo off
TITLE CampusConnect - Automated Setup ^& Dependency Installation
COLOR 0A
echo =========================================================================
echo               CampusConnect - First-Time Project Setup
echo =========================================================================
echo.
echo [Step 1/4] Installing Root Development Packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install root dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 2/4] Installing Backend Node.js / Express Packages...
call npm install --prefix server
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 3/4] Installing Frontend React / Vite / Tailwind Packages...
call npm install --prefix client
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 4/4] Seeding Database with Demo Users, Events ^& Circulars...
call npm run seed --prefix server
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database seed encountered an issue (Ensure MongoDB or Internet is available).
)

echo.
echo =========================================================================
echo                  CAMPUSCONNECT SETUP COMPLETED!
echo =========================================================================
echo.
echo DEMO LOGIN CREDENTIALS:
echo   - Admin:   admin@campusconnect.com   / Password: Admin@123
echo   - Faculty: faculty@campusconnect.com / Password: Faculty@123
echo   - Student: student@campusconnect.com / Password: Student@123
echo.
echo To start the complete system: Double-click start.bat OR run: npm run dev
echo =========================================================================
echo.
pause
