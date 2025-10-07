# 🚀 Little Harvest Boot Sequence

Complete startup and deployment guide for the Little Harvest application.

## 📋 Overview

The Little Harvest application includes multiple boot sequences for different deployment scenarios:

- **Local Development** - Quick setup for development
- **Docker Deployment** - Containerized deployment
- **Production Deployment** - Optimized production setup
- **Staging Environment** - Pre-production testing

## 🛠️ Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Optional Software
- **Docker** ([Download](https://www.docker.com/))
- **Docker Compose** (comes with Docker Desktop)
- **PostgreSQL** (for production database)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd tiny-tastes
npm run setup
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Boot Scripts

### NPM Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `npm run setup` | Complete initial setup | `npm run setup` |
| `npm run boot` | Full boot sequence with monitoring | `npm run boot` |
| `npm run boot:local` | Local development boot | `npm run boot:local` |
| `npm run boot:docker` | Docker deployment | `npm run boot:docker` |
| `npm run boot:production` | Production deployment | `npm run boot:production` |
| `npm run start:local` | Universal local start | `npm run start:local` |
| `npm run start:docker` | Universal Docker start | `npm run start:docker` |
| `npm run start:production` | Universal production start | `npm run start:production` |
| `npm run health` | Health check | `npm run health` |

### Direct Scripts

| Script | Platform | Description |
|--------|----------|-------------|
| `scripts/boot-sequence.js` | Cross-platform | Full Node.js boot sequence |
| `scripts/boot.bat` | Windows | Windows batch boot script |
| `scripts/boot.ps1` | Windows | PowerShell boot script |
| `scripts/docker-boot.sh` | Linux/macOS | Docker boot script |
| `scripts/start.sh` | Linux/macOS | Universal startup script |

## 🏗️ Boot Sequence Steps

### 1. Prerequisites Check
- ✅ Node.js installation
- ✅ npm availability
- ✅ Project structure validation
- ✅ Required files existence

### 2. Dependencies Installation
- ✅ npm install
- ✅ Package validation
- ✅ Dependency resolution

### 3. Database Setup
- ✅ Prisma client generation
- ✅ Database schema push
- ✅ Database seeding (optional)
- ✅ Connection validation

### 4. Application Startup
- ✅ Environment configuration
- ✅ Server initialization
- ✅ Health check setup
- ✅ Monitoring activation

### 5. Health Monitoring
- ✅ Service health checks
- ✅ Performance metrics
- ✅ Error monitoring
- ✅ Logging setup

## 🌍 Deployment Scenarios

### Local Development

**Quick Start:**
```bash
npm run boot:local
```

**Manual Steps:**
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

**Access Points:**
- Application: http://localhost:3000
- Prisma Studio: http://localhost:5555
- Admin Dashboard: http://localhost:3000/admin

### Docker Deployment

**Quick Start:**
```bash
npm run boot:docker
```

**Manual Steps:**
```bash
docker-compose up --build
```

**Services:**
- Application: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379
- Nginx: http://localhost:80 (production profile)

### Production Deployment

**Quick Start:**
```bash
npm run boot:production
```

**Manual Steps:**
```bash
npm ci --only=production
npm run build
npm run start
```

**Environment Variables:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/tinytastes
PORT=3000
```

### Staging Environment

**Quick Start:**
```bash
npm run start:staging
```

**Features:**
- Production-like environment
- Test database
- Performance monitoring
- Error tracking

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `DATABASE_URL` | file:./prisma/dev.db | Database connection |
| `PORT` | 3000 | Server port |
| `NEXTAUTH_URL` | http://localhost:3000 | Authentication URL |
| `NEXTAUTH_SECRET` | - | Authentication secret |

### Database Configuration

**SQLite (Development):**
```bash
DATABASE_URL="file:./prisma/dev.db"
```

**PostgreSQL (Production):**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/tinytastes"
```

### Docker Configuration

**Development:**
```bash
docker-compose up
```

**Production:**
```bash
docker-compose --profile production up
```

**With Monitoring:**
```bash
docker-compose --profile monitoring up
```

## 📊 Health Monitoring

### Health Check Endpoint
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 3600,
  "responseTime": 45,
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "type": "sqlite"
    },
    "cache": {
      "status": "healthy",
      "type": "in-memory"
    }
  }
}
```

### Metrics Endpoint
```bash
GET /api/metrics
```

**Available Formats:**
- `?format=summary` - Summary metrics
- `?format=health` - Health status
- `?format=export` - Full metrics export

## 🚨 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
netstat -an | findstr :3000

# Kill the process or use different port
set PORT=3001
npm run dev
```

**2. Database Connection Failed**
```bash
# Check database URL
echo %DATABASE_URL%

# Reset database
npm run db:reset
npm run db:push
npm run db:seed
```

**3. Dependencies Installation Failed**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. Docker Build Failed**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Log Locations

**Application Logs:**
- Development: Console output
- Production: `logs/app.log`
- Docker: `docker-compose logs app`

**Database Logs:**
- SQLite: Console output
- PostgreSQL: `logs/db.log`
- Docker: `docker-compose logs db`

## 🔄 Maintenance

### Regular Tasks

**Daily:**
- Check health endpoint
- Monitor error logs
- Verify database connectivity

**Weekly:**
- Update dependencies
- Backup database
- Review performance metrics

**Monthly:**
- Security updates
- Database optimization
- Log cleanup

### Backup Procedures

**Database Backup:**
```bash
# SQLite
cp prisma/dev.db backups/dev-$(date +%Y%m%d).db

# PostgreSQL
pg_dump $DATABASE_URL > backups/prod-$(date +%Y%m%d).sql
```

**Application Backup:**
```bash
# Create backup
tar -czf backups/app-$(date +%Y%m%d).tar.gz . --exclude=node_modules
```

## 📞 Support

### Getting Help

1. **Check Health Status:**
   ```bash
   npm run health
   ```

2. **View Logs:**
   ```bash
   # Development
   npm run dev

   # Docker
   docker-compose logs -f app
   ```

3. **Reset Environment:**
   ```bash
   npm run db:reset
   npm run setup
   ```

### Contact Information

- **Documentation:** [README.md](../README.md)
- **API Documentation:** [API.md](API.md)
- **Issues:** GitHub Issues
- **Support:** Development Team

---

**Happy Coding! 🚀**
