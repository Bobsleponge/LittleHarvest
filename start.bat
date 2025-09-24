@echo off
REM Tiny Tastes - Quick Start Script for Windows
REM This is a simple launcher for the boot sequence

echo.
echo ========================================
echo    Tiny Tastes - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo [INFO] Starting Tiny Tastes...
echo [INFO] This will install dependencies, setup database, and start the server
echo.

REM Run the setup and start sequence
call npm run setup
if errorlevel 1 (
    echo ERROR: Setup failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Setup complete! Starting development server...
echo [INFO] Server will be available at: http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev
