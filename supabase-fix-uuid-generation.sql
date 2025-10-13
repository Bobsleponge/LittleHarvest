-- Fix UUID Generation for Existing Tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update User table to use UUID with auto-generation
ALTER TABLE "User" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update Product table to use UUID with auto-generation  
ALTER TABLE "Product" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update StoreSettings table to use UUID with auto-generation
ALTER TABLE "StoreSettings" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update AgeGroup table to use UUID with auto-generation
ALTER TABLE "AgeGroup" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update Texture table to use UUID with auto-generation
ALTER TABLE "Texture" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update PortionSize table to use UUID with auto-generation
ALTER TABLE "PortionSize" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update Price table to use UUID with auto-generation
ALTER TABLE "Price" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update Package table to use UUID with auto-generation
ALTER TABLE "Package" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update PackageItem table to use UUID with auto-generation
ALTER TABLE "PackageItem" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update Profile table to use UUID with auto-generation
ALTER TABLE "Profile" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update ChildProfile table to use UUID with auto-generation
ALTER TABLE "ChildProfile" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update Cart table to use UUID with auto-generation
ALTER TABLE "Cart" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update SettingsHistory table to use UUID with auto-generation
ALTER TABLE "SettingsHistory" ALTER COLUMN id SET DEFAULT uuid_generate_v4();

SELECT 'UUID auto-generation enabled for all existing tables!' as status;
