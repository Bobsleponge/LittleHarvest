# Little Harvest - PowerShell Boot Script
# This script handles the complete startup sequence with advanced features

param(
    [string]$Environment = "development",
    [int]$Port = 3000,
    [switch]$SkipDependencies,
    [switch]$SkipDatabase,
    [switch]$SkipSeed,
    [switch]$Production,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
Little Harvest Boot Script

USAGE:
    .\boot.ps1 [OPTIONS]

OPTIONS:
    -Environment <env>     Set environment (development, production) [default: development]
    -Port <port>          Set server port [default: 3000]
    -SkipDependencies     Skip npm install
    -SkipDatabase         Skip database setup
    -SkipSeed             Skip database seeding
    -Production           Start in production mode
    -Help                 Show this help message

EXAMPLES:
    .\boot.ps1                                    # Start in development mode
    .\boot.ps1 -Production                        # Start in production mode
    .\boot.ps1 -Port 8080 -SkipSeed              # Custom port, skip seeding
    .\boot.ps1 -Environment production -Port 80  # Production on port 80
"@
    exit 0
}

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    Magenta = "Magenta"
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
    Write-Host "    Little Harvest Boot Sequence" -ForegroundColor $Colors.Cyan
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host ""

    $startTime = Get-Date

    # Set environment variables
    $env:DATABASE_URL = "file:./prisma/dev.db"
    $env:NODE_ENV = $Environment
    $env:PORT = $Port

    Write-Step "Starting boot sequence..."
    Write-Info "Environment: $Environment"
    Write-Info "Port: $Port"
    Write-Info "Production Mode: $Production"

    # Check prerequisites
    Write-Step "Checking prerequisites..."

    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH"
        Write-Info "Please install Node.js from https://nodejs.org/"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is not available"
        exit 1
    }

    # Check project structure
    Write-Step "Validating project structure..."

    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root."
        exit 1
    }

    if (-not (Test-Path "prisma")) {
        Write-Error "prisma directory not found"
        exit 1
    }

    Write-Success "Project structure validated"

    # Install dependencies
    if (-not $SkipDependencies) {
        Write-Step "Installing dependencies..."
        try {
            npm install
            Write-Success "Dependencies installed"
        }
        catch {
            Write-Error "Failed to install dependencies"
            exit 1
        }
    }
    else {
        Write-Warning "Skipping dependency installation"
    }

    # Database setup
    if (-not $SkipDatabase) {
        Write-Step "Setting up database..."

        # Generate Prisma client
        Write-Info "Generating Prisma client..."
        try {
            npx prisma generate
            Write-Success "Prisma client generated"
        }
        catch {
            Write-Error "Failed to generate Prisma client"
            exit 1
        }

        # Push database schema
        Write-Info "Pushing database schema..."
        try {
            npx prisma db push
            Write-Success "Database schema pushed"
        }
        catch {
            Write-Error "Failed to push database schema"
            exit 1
        }

        # Seed database
        if (-not $SkipSeed) {
            Write-Info "Seeding database..."
            try {
                npm run db:seed
                Write-Success "Database seeded"
            }
            catch {
                Write-Warning "Database seeding failed (this is optional)"
            }
        }
        else {
            Write-Warning "Skipping database seeding"
        }

        Write-Success "Database setup complete"
    }
    else {
        Write-Warning "Skipping database setup"
    }

    # Start server
    Write-Step "Starting server..."

    if ($Production) {
        Write-Info "Building application for production..."
        try {
            npm run build
            Write-Success "Application built"
        }
        catch {
            Write-Error "Failed to build application"
            exit 1
        }

        Write-Info "Starting production server..."
        Write-Info "Server will be available at: http://localhost:$Port"
        Write-Info "Press Ctrl+C to stop the server"
        Write-Host ""

        # Start production server
        npm run start
    }
    else {
        Write-Info "Starting development server..."
        Write-Info "Server will be available at: http://localhost:$Port"
        Write-Info "Prisma Studio will be available at: http://localhost:5555"
        Write-Info "Press Ctrl+C to stop the server"
        Write-Host ""

        # Start development server
        npm run dev
    }

    # Calculate total time
    $endTime = Get-Date
    $duration = $endTime - $startTime

    Write-Host ""
    Write-Success "Boot sequence completed successfully!"
    Write-Info "Total time: $($duration.TotalSeconds.ToString('F2')) seconds"

}
catch {
    Write-Error "Boot sequence failed: $($_.Exception.Message)"
    exit 1
}
finally {
    Write-Host ""
    Write-Info "Boot sequence finished"
}
