#!/bin/bash

# Little Harvest - Docker Boot Script
# This script handles the complete startup sequence for Docker containers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DATABASE_URL=${DATABASE_URL:-"file:./prisma/dev.db"}
NODE_ENV=${NODE_ENV:-"development"}
PORT=${PORT:-3000}
SKIP_DEPENDENCIES=${SKIP_DEPENDENCIES:-false}
SKIP_DATABASE=${SKIP_DATABASE:-false}
SKIP_SEED=${SKIP_SEED:-false}

# Logging functions
log_step() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] 🚀 $1${NC}"
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

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "    Little Harvest Docker Boot Sequence"
    echo "========================================"
    echo ""

    start_time=$(date +%s)

    log_step "Starting Docker boot sequence..."
    log_info "Environment: $NODE_ENV"
    log_info "Port: $PORT"
    log_info "Database URL: $DATABASE_URL"

    # Check prerequisites
    log_step "Checking prerequisites..."

    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        node_version=$(node --version)
        log_success "Node.js version: $node_version"
    else
        log_error "Node.js is not installed"
        exit 1
    fi

    # Check npm
    if command -v npm >/dev/null 2>&1; then
        npm_version=$(npm --version)
        log_success "npm version: $npm_version"
    else
        log_error "npm is not available"
        exit 1
    fi

    # Check project structure
    log_step "Validating project structure..."

    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi

    if [ ! -d "prisma" ]; then
        log_error "prisma directory not found"
        exit 1
    fi

    log_success "Project structure validated"

    # Install dependencies
    if [ "$SKIP_DEPENDENCIES" != "true" ]; then
        log_step "Installing dependencies..."
        if npm install; then
            log_success "Dependencies installed"
        else
            log_error "Failed to install dependencies"
            exit 1
        fi
    else
        log_warning "Skipping dependency installation"
    fi

    # Database setup
    if [ "$SKIP_DATABASE" != "true" ]; then
        log_step "Setting up database..."

        # Generate Prisma client
        log_info "Generating Prisma client..."
        if npx prisma generate; then
            log_success "Prisma client generated"
        else
            log_error "Failed to generate Prisma client"
            exit 1
        fi

        # Push database schema
        log_info "Pushing database schema..."
        if npx prisma db push; then
            log_success "Database schema pushed"
        else
            log_error "Failed to push database schema"
            exit 1
        fi

        # Seed database
        if [ "$SKIP_SEED" != "true" ]; then
            log_info "Seeding database..."
            if npm run db:seed; then
                log_success "Database seeded"
            else
                log_warning "Database seeding failed (this is optional)"
            fi
        else
            log_warning "Skipping database seeding"
        fi

        log_success "Database setup complete"
    else
        log_warning "Skipping database setup"
    fi

    # Health check
    log_step "Performing health check..."
    if [ -f "src/app/api/health/route.ts" ]; then
        log_success "Health check endpoint available"
    else
        log_warning "Health check endpoint not found"
    fi

    # Start server
    log_step "Starting server..."

    if [ "$NODE_ENV" = "production" ]; then
        log_info "Building application for production..."
        if npm run build; then
            log_success "Application built"
        else
            log_error "Failed to build application"
            exit 1
        fi

        log_info "Starting production server..."
        log_info "Server will be available at: http://localhost:$PORT"
        log_info "Press Ctrl+C to stop the server"
        echo ""

        # Start production server
        exec npm run start
    else
        log_info "Starting development server..."
        log_info "Server will be available at: http://localhost:$PORT"
        log_info "Prisma Studio will be available at: http://localhost:5555"
        log_info "Press Ctrl+C to stop the server"
        echo ""

        # Start development server
        exec npm run dev
    fi
}

# Handle signals for graceful shutdown
cleanup() {
    log_info "Received shutdown signal, cleaning up..."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Run main function
main "$@"
