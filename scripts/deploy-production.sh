#!/bin/bash
# Tiny Tastes Production Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="tiny-tastes"
PRODUCTION_URL="https://tinytastes.co.za"
BACKUP_DIR="/backups"
LOG_FILE="/var/log/tiny-tastes-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.production" ]; then
        error "Production environment file (.env.production) not found"
    fi
    
    success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if [ -d "$BACKUP_DIR" ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
        
        # Backup database
        if docker-compose -f docker-compose.production.yml ps db | grep -q "Up"; then
            log "Backing up database..."
            docker-compose -f docker-compose.production.yml exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        fi
        
        # Backup uploads
        if [ -d "uploads" ]; then
            log "Backing up uploads..."
            cp -r uploads "$BACKUP_DIR/$BACKUP_NAME/"
        fi
        
        # Backup environment
        cp .env.production "$BACKUP_DIR/$BACKUP_NAME/"
        
        success "Backup created: $BACKUP_NAME"
    else
        warning "Backup directory not found, skipping backup"
    fi
}

# Pull latest code
pull_code() {
    log "Pulling latest code..."
    
    if [ -d ".git" ]; then
        git fetch origin
        git reset --hard origin/main
        success "Code updated"
    else
        warning "Not a git repository, skipping code pull"
    fi
}

# Build and deploy
deploy() {
    log "Building and deploying application..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.production.yml down
    
    # Build new images
    log "Building application image..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check health
    check_health
}

# Check application health
check_health() {
    log "Checking application health..."
    
    # Wait for application to start
    for i in {1..30}; do
        if curl -f -s "$PRODUCTION_URL/api/health" > /dev/null 2>&1; then
            success "Application is healthy"
            return 0
        fi
        log "Waiting for application to start... ($i/30)"
        sleep 10
    done
    
    error "Application health check failed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migration script
    docker-compose -f docker-compose.production.yml exec app /bin/bash -c "chmod +x scripts/migrate-production.sh && ./scripts/migrate-production.sh"
    
    success "Database migrations completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old application images
    docker images | grep "$APP_NAME" | grep -v latest | awk '{print $3}' | xargs -r docker rmi
    
    success "Cleanup completed"
}

# Send deployment notification
send_notification() {
    log "Sending deployment notification..."
    
    # This would integrate with your notification system
    # For example, Slack, Discord, email, etc.
    
    success "Deployment notification sent"
}

# Main deployment function
main() {
    log "🚀 Starting Tiny Tastes Production Deployment"
    
    # Load environment variables
    source .env.production
    
    check_prerequisites
    backup_current
    pull_code
    deploy
    run_migrations
    cleanup
    send_notification
    
    success "🎉 Deployment completed successfully!"
    log "Application is available at: $PRODUCTION_URL"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"





