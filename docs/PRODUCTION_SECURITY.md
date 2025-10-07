# Production Security Configuration Guide

## Environment Variables

### Required Security Variables
```bash
# Authentication
NEXTAUTH_SECRET="your-cryptographically-secure-secret-here"
NEXTAUTH_URL="https://tinytastes.co.za"

# CSRF Protection
CSRF_SECRET_KEY="your-csrf-secret-key-here"

# Database Security
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
POSTGRES_PASSWORD="your-secure-database-password"

# Redis Security
REDIS_URL="redis://user:password@secure-redis:6379"

# Email Security
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-secure-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-specific-password"
EMAIL_FROM="noreply@tinytastes.co.za"

# Google OAuth Security
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Monitoring Security
GRAFANA_ADMIN_PASSWORD="your-secure-grafana-password"

# Security Settings
NODE_ENV="production"
ENABLE_DEV_AUTH="false"
LOG_LEVEL="info"
```

## Docker Security Configuration

### Secure Dockerfile
```dockerfile
# Use specific version and non-root user
FROM node:18-alpine AS base

# Install security updates
RUN apk update && apk upgrade

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production && npm audit --audit-level=high

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build application
RUN npm run build

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Secure Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - CSRF_SECRET_KEY=${CSRF_SECRET_KEY}
    ports:
      - "3000:3000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

## Nginx Security Configuration

### Secure Nginx Config
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" always;

    # Hide nginx version
    server_tokens off;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name tinytastes.co.za www.tinytastes.co.za;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tinytastes.co.za www.tinytastes.co.za;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;

        # Proxy to Next.js app
        location / {
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://app:3000;
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://app:3000/api/health;
        }
    }
}
```

## Security Monitoring Configuration

### Prometheus Security Config
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "security_rules.yml"

scrape_configs:
  - job_name: 'nextjs-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['db:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']
    scrape_interval: 30s
```

### Security Alert Rules
```yaml
groups:
  - name: security
    rules:
      - alert: HighFailedLoginRate
        expr: rate(security_events_total{type="failed_login"}[5m]) > 0.1
        for: 2m
        labels:
          severity: high
        annotations:
          summary: "High failed login rate detected"
          description: "Failed login rate is {{ $value }} per second"

      - alert: SuspiciousActivity
        expr: increase(security_events_total{type="suspicious_activity"}[5m]) > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Suspicious activity detected"
          description: "{{ $value }} suspicious activities in the last 5 minutes"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: high
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} per second"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "PostgreSQL database is down"
```

## Backup Security Configuration

### Secure Backup Script
```bash
#!/bin/bash

# Secure backup script for Tiny Tastes
set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
DB_NAME="tinytastes"
DB_USER="backup_user"
DB_HOST="db"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
echo "Starting database backup..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  --no-password \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).dump"

# Application files backup
echo "Starting application files backup..."
tar -czf "$BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=coverage \
  /app

# Cleanup old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
echo "Verifying backup integrity..."
for backup in "$BACKUP_DIR"/*.dump; do
  if [ -f "$backup" ]; then
    pg_restore --list "$backup" > /dev/null || {
      echo "ERROR: Backup $backup is corrupted"
      exit 1
    }
  fi
done

echo "Backup completed successfully"
```

## Security Checklist

### Pre-Deployment Checklist
- [ ] All environment variables configured securely
- [ ] SSL/TLS certificates installed and valid
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Database connections encrypted
- [ ] Redis authentication enabled
- [ ] File upload restrictions configured
- [ ] CSRF protection enabled
- [ ] Security monitoring configured
- [ ] Backup procedures tested
- [ ] Incident response plan ready
- [ ] Security audit completed
- [ ] Performance impact assessed
- [ ] Team training completed

### Post-Deployment Checklist
- [ ] Security monitoring active
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User authentication working
- [ ] Admin functions secure
- [ ] File uploads working securely
- [ ] API endpoints protected
- [ ] Database queries logged
- [ ] Security events logged
- [ ] Backup procedures verified
- [ ] SSL certificate monitoring
- [ ] Security alerts configured

### Ongoing Security Checklist
- [ ] Regular security updates applied
- [ ] Monitoring dashboard reviewed
- [ ] Performance impact assessed
- [ ] Security logs analyzed
- [ ] Incident response tested
- [ ] Security training updated
- [ ] Vulnerability scans completed
- [ ] Penetration testing scheduled
- [ ] Security policies reviewed
- [ ] Access controls audited
- [ ] Backup integrity verified
- [ ] Disaster recovery tested

## Emergency Procedures

### Security Incident Response
1. **Immediate Response**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team
   - Activate incident response plan

2. **Investigation**
   - Analyze security logs
   - Identify attack vector
   - Assess impact
   - Document findings

3. **Containment**
   - Block malicious IPs
   - Revoke compromised credentials
   - Update security controls
   - Monitor for continued attacks

4. **Recovery**
   - Restore from clean backups
   - Apply security patches
   - Update security configurations
   - Test system functionality

5. **Post-Incident**
   - Conduct lessons learned
   - Update security procedures
   - Improve monitoring
   - Train team on new threats

### Emergency Contacts
- **Security Team**: security@tinytastes.co.za
- **24/7 Hotline**: +27-XX-XXX-XXXX
- **Incident Response**: incident@tinytastes.co.za
- **Management**: management@tinytastes.co.za

---

*This configuration guide should be reviewed and updated regularly.*
*Last updated: [Current Date]*

