#!/bin/bash
# Database Migration Script for Production

set -e

echo "🚀 Starting Tiny Tastes Database Migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Check if we're using PostgreSQL
if [[ $DATABASE_URL == postgresql* ]]; then
    echo "📊 Detected PostgreSQL database"
    
    # Extract database connection details
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    
    echo "🔗 Connecting to database: $DB_NAME on $DB_HOST:$DB_PORT"
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
        echo "Database is unavailable - sleeping"
        sleep 2
    done
    echo "✅ Database is ready!"
    
else
    echo "📊 Detected SQLite database"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed the database with initial data
echo "🌱 Seeding database with initial data..."
npm run db:seed

# Verify database connection
echo "🔍 Verifying database connection..."
npx prisma db pull --print

echo "✅ Database migration completed successfully!"
echo "🎉 Tiny Tastes is ready for production!"





