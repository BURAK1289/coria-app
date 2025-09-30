-- Premium Service Database Schema
-- Creates tables for premium subscriptions, audit logs, rate limiting, and anti-replay protection

-- Premium subscription plans configuration
CREATE TABLE IF NOT EXISTS public.premium_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type VARCHAR(20) NOT NULL UNIQUE, -- 'monthly', 'yearly', 'lifetime'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_lamports BIGINT NOT NULL,
    price_sol DECIMAL(10,9) NOT NULL,
    duration_days INTEGER, -- NULL for lifetime
    features JSONB NOT NULL DEFAULT '[]',
    max_scans_per_month INTEGER DEFAULT NULL, -- NULL for unlimited
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT premium_plans_price_check CHECK (price_lamports >= 0),
    CONSTRAINT premium_plans_duration_check CHECK (duration_days IS NULL OR duration_days > 0)
);

-- Enhanced premium subscriptions table
CREATE TABLE IF NOT EXISTS public.premium_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.premium_plans(id),
    payment_id UUID REFERENCES public.solana_payments(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    auto_renew BOOLEAN DEFAULT false,
    features JSONB NOT NULL DEFAULT '[]',
    usage_limits JSONB DEFAULT '{}', -- Current usage tracking
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT premium_subscriptions_status_check
        CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    CONSTRAINT premium_subscriptions_expires_check
        CHECK (expires_at IS NULL OR expires_at > started_at),
    CONSTRAINT premium_subscriptions_cancelled_check
        CHECK ((status = 'cancelled' AND cancelled_at IS NOT NULL) OR
               (status != 'cancelled' AND cancelled_at IS NULL))
);

-- Feature usage tracking for premium users
CREATE TABLE IF NOT EXISTS public.premium_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.premium_subscriptions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 1,
    period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
    period_end TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
    reset_cycle VARCHAR(20) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'yearly'
    metadata JSONB DEFAULT '{}',
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT premium_feature_usage_count_check CHECK (usage_count >= 0),
    CONSTRAINT premium_feature_usage_cycle_check
        CHECK (reset_cycle IN ('daily', 'weekly', 'monthly', 'yearly')),
    CONSTRAINT premium_feature_usage_period_check CHECK (period_end > period_start),

    -- Unique constraint per user, feature, and period
    UNIQUE(user_id, subscription_id, feature_name, period_start)
);

-- Rate limiting table for API calls
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    identifier VARCHAR(255) NOT NULL, -- IP address, user ID, or custom identifier
    operation VARCHAR(100) NOT NULL, -- API operation name
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    request_count INTEGER DEFAULT 1,
    limit_type VARCHAR(20) DEFAULT 'user', -- 'user', 'ip', 'global'
    tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium', 'admin'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT rate_limits_count_check CHECK (request_count >= 0),
    CONSTRAINT rate_limits_window_check CHECK (window_end > window_start),
    CONSTRAINT rate_limits_type_check
        CHECK (limit_type IN ('user', 'ip', 'global')),
    CONSTRAINT rate_limits_tier_check
        CHECK (tier IN ('free', 'premium', 'admin')),

    -- Unique constraint per identifier, operation, and window
    UNIQUE(identifier, operation, window_start)
);

-- Anti-replay nonce table
CREATE TABLE IF NOT EXISTS public.anti_replay_nonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    nonce VARCHAR(255) NOT NULL UNIQUE,
    operation VARCHAR(100) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT anti_replay_nonces_expiry_check CHECK (expires_at > created_at),
    CONSTRAINT anti_replay_nonces_used_check
        CHECK ((used_at IS NULL) OR (used_at >= created_at AND used_at <= expires_at))
);

-- Comprehensive audit log for premium operations
CREATE TABLE IF NOT EXISTS public.premium_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.premium_subscriptions(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'subscription', 'payment', 'feature_usage', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    severity VARCHAR(20) DEFAULT 'info', -- 'debug', 'info', 'warn', 'error', 'critical'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT premium_audit_logs_severity_check
        CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical'))
);

-- Security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    blocked BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0, -- 0-100 risk score
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT security_events_severity_check
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT security_events_risk_check
        CHECK (risk_score >= 0 AND risk_score <= 100)
);

-- Performance indexes for efficient queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_premium_subscriptions_user_status
    ON public.premium_subscriptions(user_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_premium_subscriptions_expires_at
    ON public.premium_subscriptions(expires_at) WHERE expires_at IS NOT NULL AND status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_premium_feature_usage_user_period
    ON public.premium_feature_usage(user_id, feature_name, period_start);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_identifier_operation
    ON public.rate_limits(identifier, operation, window_start);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_cleanup
    ON public.rate_limits(window_end) WHERE window_end < NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anti_replay_nonces_cleanup
    ON public.anti_replay_nonces(expires_at) WHERE expires_at < NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_premium_audit_logs_user_action
    ON public.premium_audit_logs(user_id, action, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_severity_created
    ON public.security_events(severity, created_at) WHERE severity IN ('high', 'critical');

-- Insert default premium plans
INSERT INTO public.premium_plans (plan_type, name, description, price_lamports, price_sol, duration_days, features, max_scans_per_month) VALUES
('monthly', 'Premium Monthly', 'Monthly premium subscription with unlimited scans', 1000000000, 1.0, 30,
 '["unlimited_scans", "ai_assistant", "export_data", "priority_support"]'::jsonb, NULL),
('yearly', 'Premium Yearly', 'Yearly premium subscription with 20% discount', 10000000000, 10.0, 365,
 '["unlimited_scans", "ai_assistant", "export_data", "priority_support", "advanced_analytics"]'::jsonb, NULL),
('lifetime', 'Premium Lifetime', 'Lifetime premium access', 50000000000, 50.0, NULL,
 '["unlimited_scans", "ai_assistant", "export_data", "priority_support", "advanced_analytics", "custom_recipes"]'::jsonb, NULL)
ON CONFLICT (plan_type) DO UPDATE SET
    price_lamports = EXCLUDED.price_lamports,
    price_sol = EXCLUDED.price_sol,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Update user_profiles to track premium status (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN is_premium BOOLEAN DEFAULT false,
        ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;

        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_premium
            ON public.user_profiles(is_premium, premium_expires_at) WHERE is_premium = true;
    END IF;
END $$;