@echo off
REM Little Harvest - Desktop Launcher
REM Double-click this file to start your Little Harvest application

title Little Harvest - Starting Application...

echo.
echo ========================================
echo    Little Harvest - Desktop Launcher
echo ========================================
echo.

REM Change to the application directory
cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: This launcher must be in the Little Harvest project folder
    echo Please move this file to your project root directory
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting Little Harvest Application...
echo [INFO] This may take a moment on first run...
echo.

REM Set environment variables
set DATABASE_URL=file:./prisma/dev.db
set NODE_ENV=development
set PORT=3000

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [SETUP] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
)

REM Check if database exists
if not exist "prisma\dev.db" (
    echo [SETUP] Setting up database...
    call npx prisma generate
    call npx prisma db push
    call npm run db:seed
    echo [SUCCESS] Database setup complete
)

echo.
echo [SUCCESS] Starting Little Harvest...
echo.
echo ========================================
echo    Application Starting...
echo ========================================
echo.
echo 🌐 Application: http://localhost:3000
echo 🔐 Quick Login: http://localhost:3000/dev-login
echo 👨‍💼 Admin Panel: http://localhost:3000/admin
echo.
echo 📋 Test Accounts:
echo    Admin: admin@tinytastes.co.za
echo    Customer: customer@example.com
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server
call npm run dev

REM If we reach here, the server was stopped
echo.
echo [INFO] Little Harvest has been stopped
pause
