-- Create missing tables for Little Harvest
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Ingredient table
CREATE TABLE IF NOT EXISTS "Ingredient" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    "currentStock" DECIMAL(10, 2) DEFAULT 0,
    "minStock" DECIMAL(10, 2) DEFAULT 0,
    "maxStock" DECIMAL(10, 2) DEFAULT 0,
    "unitCost" DECIMAL(10, 2) DEFAULT 0,
    supplier VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    "lastRestocked" TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Allergen table
CREATE TABLE IF NOT EXISTS "Allergen" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DietaryRequirement table
CREATE TABLE IF NOT EXISTS "DietaryRequirement" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create UISettings table
CREATE TABLE IF NOT EXISTS "UISettings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    "updatedBy" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Create SecurityAlert table
CREATE TABLE IF NOT EXISTS "SecurityAlert" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) DEFAULT 'INFO',
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredient_name ON "Ingredient"(name);
CREATE INDEX IF NOT EXISTS idx_ingredient_category ON "Ingredient"(category);
CREATE INDEX IF NOT EXISTS idx_ingredient_status ON "Ingredient"(status);
CREATE INDEX IF NOT EXISTS idx_allergen_name ON "Allergen"(name);
CREATE INDEX IF NOT EXISTS idx_dietary_requirement_name ON "DietaryRequirement"(name);
CREATE INDEX IF NOT EXISTS idx_ui_settings_category ON "UISettings"(category);
CREATE INDEX IF NOT EXISTS idx_security_alert_type ON "SecurityAlert"(type);
CREATE INDEX IF NOT EXISTS idx_security_alert_severity ON "SecurityAlert"(severity);

-- Enable RLS
ALTER TABLE "Ingredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Allergen" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DietaryRequirement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UISettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecurityAlert" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Ingredients: Only admins can manage
CREATE POLICY "Admins can manage ingredients" ON "Ingredient" FOR ALL USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

-- Allergens: Public read, admin write
CREATE POLICY "Public can view allergens" ON "Allergen" FOR SELECT USING (true);
CREATE POLICY "Admins can manage allergens" ON "Allergen" FOR ALL USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

-- Dietary Requirements: Public read, admin write
CREATE POLICY "Public can view dietary requirements" ON "DietaryRequirement" FOR SELECT USING (true);
CREATE POLICY "Admins can manage dietary requirements" ON "DietaryRequirement" FOR ALL USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

-- UI Settings: Only admins can manage
CREATE POLICY "Admins can manage UI settings" ON "UISettings" FOR ALL USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

-- Security Alerts: Only admins can view, system can create
CREATE POLICY "Admins can view security alerts" ON "SecurityAlert" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);
CREATE POLICY "System can create security alerts" ON "SecurityAlert" FOR INSERT WITH CHECK (true);

-- Create triggers for updatedAt
CREATE TRIGGER update_ingredient_updated_at BEFORE UPDATE ON "Ingredient" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allergen_updated_at BEFORE UPDATE ON "Allergen" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dietary_requirement_updated_at BEFORE UPDATE ON "DietaryRequirement" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ui_settings_updated_at BEFORE UPDATE ON "UISettings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Missing tables created successfully!' as status;
