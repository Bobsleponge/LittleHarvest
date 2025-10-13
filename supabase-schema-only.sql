-- Supabase Migration Script - Schema First
-- Run this in Supabase SQL Editor

-- Step 1: Create cache and rate limiting tables
CREATE TABLE IF NOT EXISTS cache_items (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(255) PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    reset_time BIGINT NOT NULL,
    first_request BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cache_items_expires_at ON cache_items(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time);

-- Step 2: Create main application tables
-- User table
CREATE TABLE IF NOT EXISTS "User" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AgeGroup table
CREATE TABLE IF NOT EXISTS "AgeGroup" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "minMonths" INTEGER NOT NULL,
    "maxMonths" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Texture table
CREATE TABLE IF NOT EXISTS "Texture" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PortionSize table
CREATE TABLE IF NOT EXISTS "PortionSize" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    measurement VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product table
CREATE TABLE IF NOT EXISTS "Product" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "ageGroupId" VARCHAR(255) REFERENCES "AgeGroup"(id),
    "textureId" VARCHAR(255) REFERENCES "Texture"(id),
    "isActive" BOOLEAN DEFAULT true,
    "imageUrl" VARCHAR(255),
    contains TEXT,
    "mayContain" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price table
CREATE TABLE IF NOT EXISTS "Price" (
    id VARCHAR(255) PRIMARY KEY,
    "productId" VARCHAR(255) REFERENCES "Product"(id),
    "portionSizeId" VARCHAR(255) REFERENCES "PortionSize"(id),
    "amountZar" INTEGER NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package table
CREATE TABLE IF NOT EXISTS "Package" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PackageItem table
CREATE TABLE IF NOT EXISTS "PackageItem" (
    id VARCHAR(255) PRIMARY KEY,
    "packageId" VARCHAR(255) REFERENCES "Package"(id),
    "productId" VARCHAR(255) REFERENCES "Product"(id),
    "portionSizeId" VARCHAR(255) REFERENCES "PortionSize"(id),
    quantity INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile table
CREATE TABLE IF NOT EXISTS "Profile" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "User"(id),
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    phone VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ChildProfile table
CREATE TABLE IF NOT EXISTS "ChildProfile" (
    id VARCHAR(255) PRIMARY KEY,
    "profileId" VARCHAR(255) REFERENCES "Profile"(id),
    name VARCHAR(255) NOT NULL,
    "dateOfBirth" DATE,
    gender VARCHAR(50),
    allergies JSONB,
    "dietaryRequirements" JSONB,
    "foodPreferences" JSONB,
    "medicalNotes" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS "Cart" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- StoreSettings table
CREATE TABLE IF NOT EXISTS "StoreSettings" (
    id VARCHAR(255) PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "updatedBy" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SettingsHistory table
CREATE TABLE IF NOT EXISTS "SettingsHistory" (
    id VARCHAR(255) PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" VARCHAR(255),
    "changeReason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test the tables
SELECT 'Schema created successfully! Ready for data migration.' as status;
