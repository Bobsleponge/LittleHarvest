@echo off
REM Little Harvest - Windows Boot Script
REM This script handles the complete startup sequence for Windows

setlocal enabledelayedexpansion

echo.
echo ========================================
echo    Little Harvest Boot Sequence
echo ========================================
echo.

REM Set environment variables
set DATABASE_URL=file:./prisma/dev.db
set NODE_ENV=development
set PORT=3000

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version

echo [INFO] npm version:
npm --version

echo.
echo [STEP 1] Checking project structure...

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if prisma directory exists
if not exist "prisma" (
    echo ERROR: prisma directory not found
    pause
    exit /b 1
)

echo [SUCCESS] Project structure validated

echo.
echo [STEP 2] Installing dependencies...

REM Install dependencies
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies installed

echo.
echo [STEP 3] Setting up database...

REM Generate Prisma client
echo [INFO] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

REM Push database schema
echo [INFO] Pushing database schema...
set DATABASE_URL=file:./prisma/dev.db
call npx prisma db push
if errorlevel 1 (
    echo ERROR: Failed to push database schema
    pause
    exit /b 1
)

REM Seed database
echo [INFO] Seeding database...
call npm run db:seed
if errorlevel 1 (
    echo WARNING: Database seeding failed (this is optional)
)

echo [SUCCESS] Database setup complete

echo.
echo [STEP 4] Starting development server...

REM Start the development server
echo [INFO] Starting Next.js development server...
echo [INFO] Server will be available at: http://localhost:%PORT%
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Start the server
call npm run dev

REM If we reach here, the server was stopped
echo.
echo [INFO] Development server stopped
pause
