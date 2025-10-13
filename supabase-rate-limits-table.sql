-- Create rate_limits table for rate limiting functionality
CREATE TABLE IF NOT EXISTS "rate_limits" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    reset_time BIGINT NOT NULL,
    first_request BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON "rate_limits"(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON "rate_limits"(reset_time);

-- Enable RLS
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;

-- Create policy for system access only
CREATE POLICY "System can manage rate limits" ON "rate_limits" FOR ALL USING (true);

SELECT 'Rate limits table created successfully!' as status;
