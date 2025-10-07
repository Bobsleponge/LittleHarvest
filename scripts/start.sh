#!/bin/bash

# Little Harvest - Universal Startup Script
# Handles all deployment scenarios: local, Docker, production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MODE=${1:-"local"}

# Logging functions
log() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] ℹ️  $1${NC}"
}

# Show usage
show_usage() {
    echo "Little Harvest - Universal Startup Script"
    echo ""
    echo "USAGE:"
    echo "  ./scripts/start.sh [MODE]"
    echo ""
    echo "MODES:"
    echo "  local       Start locally with npm (default)"
    echo "  docker      Start with Docker Compose"
    echo "  production  Start in production mode"
    echo "  dev         Start in development mode with all services"
    echo "  staging     Start in staging mode"
    echo ""
    echo "EXAMPLES:"
    echo "  ./scripts/start.sh local"
    echo "  ./scripts/start.sh docker"
    echo "  ./scripts/start.sh production"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Start local development
start_local() {
    log "Starting local development environment..."
    
    # Set environment variables
    export NODE_ENV=development
    export DATABASE_URL="file:./prisma/dev.db"
    export PORT=3000
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    # Setup database
    log_info "Setting up database..."
    npx prisma generate
    npx prisma db push
    
    # Seed database
    log_info "Seeding database..."
    npm run db:seed || log_warning "Database seeding failed (optional)"
    
    # Start development server
    log_success "Starting development server..."
    log_info "Server: http://localhost:3000"
    log_info "Prisma Studio: http://localhost:5555"
    log_info "Admin Dashboard: http://localhost:3000/admin"
    
    npm run dev
}

# Start with Docker
start_docker() {
    log "Starting with Docker Compose..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi
    
    # Start services
    log_info "Starting Docker services..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Check health
    log_info "Checking service health..."
    curl -f http://localhost:3000/api/health || log_warning "Health check failed"
    
    log_success "Docker services started"
    log_info "Application: http://localhost:3000"
    log_info "Database: localhost:5432"
    log_info "Redis: localhost:6379"
    
    # Show logs
    docker-compose logs -f app
}

# Start production
start_production() {
    log "Starting in production mode..."
    
    # Set environment variables
    export NODE_ENV=production
    export DATABASE_URL=${DATABASE_URL:-"file:./prisma/prod.db"}
    export PORT=${PORT:-3000}
    
    # Install dependencies
    log_info "Installing production dependencies..."
    npm ci --only=production
    
    # Setup database
    log_info "Setting up production database..."
    npx prisma generate
    npx prisma db push
    
    # Build application
    log_info "Building application..."
    npm run build
    
    # Start production server
    log_success "Starting production server..."
    log_info "Server: http://localhost:$PORT"
    
    npm run start
}

# Start development with all services
start_dev() {
    log "Starting development environment with all services..."
    
    # Start Docker services
    start_docker
    
    # Also start local development server for hot reloading
    log_info "Starting local development server for hot reloading..."
    npm run dev
}

# Start staging
start_staging() {
    log "Starting in staging mode..."
    
    # Set environment variables
    export NODE_ENV=staging
    export DATABASE_URL=${DATABASE_URL:-"file:./prisma/staging.db"}
    export PORT=${PORT:-3000}
    
    # Install dependencies
    npm ci
    
    # Setup database
    npx prisma generate
    npx prisma db push
    npm run db:seed || log_warning "Database seeding failed (optional)"
    
    # Build application
    npm run build
    
    # Start server
    npm run start
}

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "    Little Harvest Universal Startup"
    echo "========================================"
    echo ""
    
    log_info "Mode: $MODE"
    log_info "Project Root: $PROJECT_ROOT"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Check prerequisites
    check_prerequisites
    
    # Start based on mode
    case $MODE in
        "local")
            start_local
            ;;
        "docker")
            start_docker
            ;;
        "production")
            start_production
            ;;
        "dev")
            start_dev
            ;;
        "staging")
            start_staging
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            log_error "Unknown mode: $MODE"
            show_usage
            exit 1
            ;;
    esac
}

# Handle signals
cleanup() {
    log_info "Received shutdown signal, cleaning up..."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Run main function
main "$@"
