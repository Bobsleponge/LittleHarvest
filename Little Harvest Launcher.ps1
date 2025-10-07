# Little Harvest - PowerShell Desktop Launcher
# Double-click this file to start your Little Harvest application

# Set the window title
$Host.UI.RawUI.WindowTitle = "Little Harvest - Starting Application..."

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Prefix$Message" -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput $Message "Cyan" "🚀 "
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput $Message "Green" "✅ "
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput $Message "Red" "❌ "
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput $Message "Yellow" "⚠️  "
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput $Message "Blue" "ℹ️  "
}

# Main execution
try {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host "    Little Harvest - Desktop Launcher" -ForegroundColor $Colors.Cyan
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host ""

    # Change to the script directory
    $ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $ScriptPath

    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Error "This launcher must be in the Little Harvest project folder"
        Write-Info "Please move this file to your project root directory"
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed"
        Write-Info "Please install Node.js from https://nodejs.org/"
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Check if npm is available
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is not available"
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Step "Starting Little Harvest Application..."
    Write-Info "This may take a moment on first run..."

    # Set environment variables
    $env:DATABASE_URL = "file:./prisma/dev.db"
    $env:NODE_ENV = "development"
    $env:PORT = "3000"

    # Check if dependencies are installed
    if (-not (Test-Path "node_modules")) {
        Write-Step "Installing dependencies..."
        try {
            npm install
            Write-Success "Dependencies installed"
        }
        catch {
            Write-Error "Failed to install dependencies"
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    # Check if database exists
    if (-not (Test-Path "prisma/dev.db")) {
        Write-Step "Setting up database..."
        try {
            npx prisma generate
            npx prisma db push
            npm run db:seed
            Write-Success "Database setup complete"
        }
        catch {
            Write-Warning "Database setup had issues, but continuing..."
        }
    }

    Write-Host ""
    Write-Success "Starting Little Harvest..."
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host "    Application Starting..." -ForegroundColor $Colors.Cyan
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host ""
    Write-Info "🌐 Application: http://localhost:3000"
    Write-Info "🔐 Quick Login: http://localhost:3000/dev-login"
    Write-Info "👨‍💼 Admin Panel: http://localhost:3000/admin"
    Write-Host ""
    Write-Info "📋 Test Accounts:"
    Write-Info "   Admin: admin@tinytastes.co.za"
    Write-Info "   Customer: customer@example.com"
    Write-Host ""
    Write-Info "Press Ctrl+C to stop the server"
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host ""

    # Start the development server
    npm run dev

    # If we reach here, the server was stopped
    Write-Host ""
    Write-Info "Little Harvest has been stopped"
    Read-Host "Press Enter to exit"

}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Read-Host "Press Enter to exit"
    exit 1
}
