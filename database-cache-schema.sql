-- PostgreSQL Cache and Rate Limiting Tables
-- Run this after setting up Supabase

-- Cache items table
CREATE TABLE IF NOT EXISTS cache_items (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(255) PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    reset_time BIGINT NOT NULL,
    first_request BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_items_expires_at ON cache_items(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time);

-- Cleanup function for expired cache items
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cache_items WHERE expires_at < NOW();
    DELETE FROM rate_limits WHERE reset_time < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired items
-- This can be set up in Supabase dashboard or via cron job
-- SELECT cron.schedule('cleanup-cache', '*/5 * * * *', 'SELECT cleanup_expired_cache();');
