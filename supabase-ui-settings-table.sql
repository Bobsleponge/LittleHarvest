-- Create UI Settings Table for Supabase
-- This table stores UI configuration settings for the Little Harvest app

-- Create the StoreSettings table
CREATE TABLE IF NOT EXISTS "StoreSettings" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of category and key
    UNIQUE(category, key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_settings_category ON "StoreSettings"(category);
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON "StoreSettings"(key);
CREATE INDEX IF NOT EXISTS idx_store_settings_active ON "StoreSettings"("isActive");

-- Insert default UI settings
INSERT INTO "StoreSettings" (category, key, value, description) VALUES
-- Brand Settings
('ui', 'brand.siteName', '"Little Harvest"', 'The main site name displayed in the header and title'),
('ui', 'brand.tagline', '"Nutritious meals for little ones"', 'The tagline displayed under the site name'),
('ui', 'brand.logoUrl', '""', 'URL to the site logo image'),
('ui', 'brand.faviconUrl', '""', 'URL to the site favicon'),

-- Color Settings
('ui', 'colors.primary', '"#10b981"', 'Primary brand color (emerald-500)'),
('ui', 'colors.secondary', '"#059669"', 'Secondary brand color (emerald-600)'),
('ui', 'colors.accent', '"#34d399"', 'Accent color (emerald-400)'),
('ui', 'colors.background', '"#ffffff"', 'Background color'),
('ui', 'colors.text', '"#111827"', 'Text color (gray-900)'),
('ui', 'colors.muted', '"#6b7280"', 'Muted text color (gray-500)'),
('ui', 'colors.success', '"#10b981"', 'Success color'),
('ui', 'colors.warning', '"#f59e0b"', 'Warning color'),
('ui', 'colors.error', '"#ef4444"', 'Error color'),
('ui', 'colors.info', '"#3b82f6"', 'Info color'),

-- Light Theme
('ui', 'themes.light.primary', '"#10b981"', 'Light theme primary color'),
('ui', 'themes.light.secondary', '"#059669"', 'Light theme secondary color'),
('ui', 'themes.light.accent', '"#34d399"', 'Light theme accent color'),
('ui', 'themes.light.background', '"#ffffff"', 'Light theme background color'),
('ui', 'themes.light.text', '"#111827"', 'Light theme text color'),
('ui', 'themes.light.muted', '"#6b7280"', 'Light theme muted color'),
('ui', 'themes.light.success', '"#10b981"', 'Light theme success color'),
('ui', 'themes.light.warning', '"#f59e0b"', 'Light theme warning color'),
('ui', 'themes.light.error', '"#ef4444"', 'Light theme error color'),
('ui', 'themes.light.info', '"#3b82f6"', 'Light theme info color'),

-- Dark Theme
('ui', 'themes.dark.primary', '"#34d399"', 'Dark theme primary color'),
('ui', 'themes.dark.secondary', '"#10b981"', 'Dark theme secondary color'),
('ui', 'themes.dark.accent', '"#6ee7b7"', 'Dark theme accent color'),
('ui', 'themes.dark.background', '"#111827"', 'Dark theme background color'),
('ui', 'themes.dark.text', '"#f9fafb"', 'Dark theme text color'),
('ui', 'themes.dark.muted', '"#9ca3af"', 'Dark theme muted color'),
('ui', 'themes.dark.success', '"#34d399"', 'Dark theme success color'),
('ui', 'themes.dark.warning', '"#fbbf24"', 'Dark theme warning color'),
('ui', 'themes.dark.error', '"#f87171"', 'Dark theme error color'),
('ui', 'themes.dark.info', '"#60a5fa"', 'Dark theme info color'),

-- Theme Configuration
('ui', 'themes.active', '"light"', 'Currently active theme'),
('ui', 'themes.custom', '[]', 'Custom themes array'),

-- Typography Settings
('ui', 'typography.fontFamily', '"Inter, system-ui, sans-serif"', 'Main font family'),
('ui', 'typography.headingFont', '"Inter, system-ui, sans-serif"', 'Heading font family'),
('ui', 'typography.fontSize', '"medium"', 'Font size setting'),
('ui', 'typography.lineHeight', '"normal"', 'Line height setting'),

-- Layout Settings
('ui', 'layout.headerHeight', '64', 'Header height in pixels'),
('ui', 'layout.sidebarWidth', '256', 'Sidebar width in pixels'),
('ui', 'layout.borderRadius', '"medium"', 'Border radius setting'),
('ui', 'layout.spacing', '"normal"', 'Spacing setting'),

-- Animation Settings
('ui', 'animations.transitions', 'true', 'Enable transitions'),
('ui', 'animations.duration', '200', 'Animation duration in milliseconds'),
('ui', 'animations.easing', '"ease-in-out"', 'Animation easing function'),
('ui', 'animations.reducedMotion', 'false', 'Respect reduced motion preference'),

-- Accessibility Settings
('ui', 'accessibility.highContrast', 'false', 'Enable high contrast mode'),
('ui', 'accessibility.reducedMotion', 'false', 'Enable reduced motion'),
('ui', 'accessibility.fontSize', '"medium"', 'Font size accessibility setting'),
('ui', 'accessibility.focusVisible', 'true', 'Enable focus visible indicators'),

-- Social Media Links
('ui', 'social.facebook', '""', 'Facebook page URL'),
('ui', 'social.instagram', '""', 'Instagram profile URL'),
('ui', 'social.twitter', '""', 'Twitter profile URL'),
('ui', 'social.linkedin', '""', 'LinkedIn profile URL'),

-- Contact Information
('ui', 'contact.email', '""', 'Contact email address'),
('ui', 'contact.phone', '""', 'Contact phone number'),
('ui', 'contact.address', '""', 'Business address'),

-- Advanced Settings
('ui', 'advanced.customCSS', '""', 'Custom CSS code'),
('ui', 'advanced.customJS', '""', 'Custom JavaScript code'),
('ui', 'advanced.themePresets', '[]', 'Custom theme presets array');

-- Create a function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updatedAt timestamp
DROP TRIGGER IF EXISTS trigger_update_store_settings_updated_at ON "StoreSettings";
CREATE TRIGGER trigger_update_store_settings_updated_at
    BEFORE UPDATE ON "StoreSettings"
    FOR EACH ROW
    EXECUTE FUNCTION update_store_settings_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE "StoreSettings" ENABLE ROW LEVEL SECURITY;

-- Create policies for the StoreSettings table
-- Allow public read access to active UI settings
CREATE POLICY "Allow public read access to active UI settings" ON "StoreSettings"
    FOR SELECT USING ("isActive" = true);

-- Allow authenticated users to read all settings
CREATE POLICY "Allow authenticated users to read all settings" ON "StoreSettings"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage all settings
CREATE POLICY "Allow service role to manage all settings" ON "StoreSettings"
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON "StoreSettings" TO anon;
GRANT SELECT ON "StoreSettings" TO authenticated;
GRANT ALL ON "StoreSettings" TO service_role;

-- Create a view for easy access to UI settings
CREATE OR REPLACE VIEW "UISettingsView" AS
SELECT 
    key,
    value,
    description,
    "isActive",
    "createdAt",
    "updatedAt"
FROM "StoreSettings"
WHERE category = 'ui' AND "isActive" = true
ORDER BY key;

-- Grant permissions on the view
GRANT SELECT ON "UISettingsView" TO anon;
GRANT SELECT ON "UISettingsView" TO authenticated;

-- Success message
SELECT 'UI Settings table created successfully with default values!' as status;
