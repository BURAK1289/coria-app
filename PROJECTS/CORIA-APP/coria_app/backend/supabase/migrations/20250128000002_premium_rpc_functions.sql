-- Premium Service RPC Functions for Optimization
-- These functions provide atomic operations and better performance for premium service operations

-- Function to upsert premium feature usage with atomic increment
CREATE OR REPLACE FUNCTION upsert_premium_feature_usage(
    p_user_id UUID,
    p_subscription_id UUID,
    p_feature_name VARCHAR(100),
    p_increment INTEGER DEFAULT 1,
    p_period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
    p_period_end TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
    p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
    current_usage INTEGER;
BEGIN
    -- Upsert feature usage record
    INSERT INTO public.premium_feature_usage (
        user_id,
        subscription_id,
        feature_name,
        usage_count,
        period_start,
        period_end,
        metadata,
        last_used_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_subscription_id,
        p_feature_name,
        p_increment,
        p_period_start,
        p_period_end,
        p_metadata,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, subscription_id, feature_name, period_start)
    DO UPDATE SET
        usage_count = premium_feature_usage.usage_count + p_increment,
        metadata = p_metadata,
        last_used_at = NOW(),
        updated_at = NOW()
    RETURNING usage_count INTO current_usage;

    RETURN current_usage;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert rate limit with atomic increment
CREATE OR REPLACE FUNCTION upsert_rate_limit(
    p_identifier VARCHAR(255),
    p_operation VARCHAR(100),
    p_window_start TIMESTAMP WITH TIME ZONE,
    p_window_end TIMESTAMP WITH TIME ZONE,
    p_tier VARCHAR(20),
    p_user_id UUID DEFAULT NULL,
    p_increment INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Upsert rate limit record
    INSERT INTO public.rate_limits (
        identifier,
        operation,
        window_start,
        window_end,
        request_count,
        limit_type,
        tier,
        user_id,
        updated_at
    ) VALUES (
        p_identifier,
        p_operation,
        p_window_start,
        p_window_end,
        p_increment,
        CASE
            WHEN p_user_id IS NOT NULL THEN 'user'
            WHEN p_identifier = 'global' THEN 'global'
            ELSE 'ip'
        END,
        p_tier,
        p_user_id,
        NOW()
    )
    ON CONFLICT (identifier, operation, window_start)
    DO UPDATE SET
        request_count = rate_limits.request_count + p_increment,
        updated_at = NOW()
    RETURNING request_count INTO current_count;

    RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check and expire premium subscriptions
CREATE OR REPLACE FUNCTION expire_premium_subscriptions()
RETURNS TABLE(expired_subscription_id UUID, user_id UUID) AS $$
BEGIN
    -- Update expired subscriptions
    UPDATE public.premium_subscriptions
    SET
        status = 'expired',
        updated_at = NOW()
    WHERE
        status = 'active'
        AND expires_at IS NOT NULL
        AND expires_at <= NOW();

    -- Update user profiles for expired subscriptions
    UPDATE public.user_profiles
    SET
        is_premium = false,
        premium_expires_at = NULL,
        updated_at = NOW()
    WHERE user_id IN (
        SELECT ps.user_id
        FROM public.premium_subscriptions ps
        WHERE ps.status = 'expired'
        AND ps.updated_at >= NOW() - INTERVAL '1 minute' -- Just updated
    );

    -- Return expired subscription details
    RETURN QUERY
    SELECT ps.id, ps.user_id
    FROM public.premium_subscriptions ps
    WHERE ps.status = 'expired'
    AND ps.updated_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Function to get premium subscription with plan details
CREATE OR REPLACE FUNCTION get_premium_subscription_with_plan(p_user_id UUID)
RETURNS TABLE(
    subscription_id UUID,
    plan_id UUID,
    payment_id UUID,
    status VARCHAR(20),
    started_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    auto_renew BOOLEAN,
    features JSONB,
    usage_limits JSONB,
    metadata JSONB,
    plan_type VARCHAR(20),
    plan_name VARCHAR(100),
    plan_description TEXT,
    price_lamports BIGINT,
    price_sol DECIMAL(10,9),
    duration_days INTEGER,
    plan_features JSONB,
    max_scans_per_month INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.plan_id,
        ps.payment_id,
        ps.status,
        ps.started_at,
        ps.expires_at,
        ps.cancelled_at,
        ps.cancellation_reason,
        ps.auto_renew,
        ps.features,
        ps.usage_limits,
        ps.metadata,
        pp.plan_type,
        pp.name,
        pp.description,
        pp.price_lamports,
        pp.price_sol,
        pp.duration_days,
        pp.features,
        pp.max_scans_per_month
    FROM public.premium_subscriptions ps
    JOIN public.premium_plans pp ON ps.plan_id = pp.id
    WHERE ps.user_id = p_user_id
    AND ps.status = 'active'
    ORDER BY ps.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get feature usage for current period
CREATE OR REPLACE FUNCTION get_current_feature_usage(
    p_user_id UUID,
    p_feature_name VARCHAR(100),
    p_period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW())
)
RETURNS TABLE(
    usage_count INTEGER,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pfu.usage_count,
        pfu.period_start,
        pfu.period_end,
        pfu.last_used_at
    FROM public.premium_feature_usage pfu
    WHERE pfu.user_id = p_user_id
    AND pfu.feature_name = p_feature_name
    AND pfu.period_start = p_period_start
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired records (called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_premium_records(
    p_nonce_hours INTEGER DEFAULT 24,
    p_rate_limit_hours INTEGER DEFAULT 24,
    p_audit_log_days INTEGER DEFAULT 90
)
RETURNS TABLE(
    cleaned_nonces INTEGER,
    cleaned_rate_limits INTEGER,
    cleaned_audit_logs INTEGER,
    cleaned_security_events INTEGER
) AS $$
DECLARE
    nonce_count INTEGER := 0;
    rate_limit_count INTEGER := 0;
    audit_log_count INTEGER := 0;
    security_event_count INTEGER := 0;
BEGIN
    -- Clean up expired nonces
    WITH deleted_nonces AS (
        DELETE FROM public.anti_replay_nonces
        WHERE created_at < NOW() - (p_nonce_hours || ' hours')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO nonce_count FROM deleted_nonces;

    -- Clean up old rate limits
    WITH deleted_rate_limits AS (
        DELETE FROM public.rate_limits
        WHERE window_end < NOW() - (p_rate_limit_hours || ' hours')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO rate_limit_count FROM deleted_rate_limits;

    -- Clean up old audit logs (keep warnings and errors longer)
    WITH deleted_audit_logs AS (
        DELETE FROM public.premium_audit_logs
        WHERE created_at < NOW() - (p_audit_log_days || ' days')::INTERVAL
        AND severity IN ('debug', 'info')
        RETURNING id
    )
    SELECT COUNT(*) INTO audit_log_count FROM deleted_audit_logs;

    -- Clean up old security events (keep high and critical severity longer)
    WITH deleted_security_events AS (
        DELETE FROM public.security_events
        WHERE created_at < NOW() - (30 || ' days')::INTERVAL
        AND severity IN ('low', 'medium')
        RETURNING id
    )
    SELECT COUNT(*) INTO security_event_count FROM deleted_security_events;

    RETURN QUERY SELECT nonce_count, rate_limit_count, audit_log_count, security_event_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get premium statistics
CREATE OR REPLACE FUNCTION get_premium_statistics()
RETURNS TABLE(
    total_active_subscriptions BIGINT,
    total_expired_subscriptions BIGINT,
    total_cancelled_subscriptions BIGINT,
    monthly_subscriptions BIGINT,
    yearly_subscriptions BIGINT,
    lifetime_subscriptions BIGINT,
    total_revenue_lamports BIGINT,
    active_premium_users BIGINT,
    subscriptions_expiring_soon BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.premium_subscriptions WHERE status = 'active'),
        (SELECT COUNT(*) FROM public.premium_subscriptions WHERE status = 'expired'),
        (SELECT COUNT(*) FROM public.premium_subscriptions WHERE status = 'cancelled'),
        (SELECT COUNT(*) FROM public.premium_subscriptions ps
         JOIN public.premium_plans pp ON ps.plan_id = pp.id
         WHERE ps.status = 'active' AND pp.plan_type = 'monthly'),
        (SELECT COUNT(*) FROM public.premium_subscriptions ps
         JOIN public.premium_plans pp ON ps.plan_id = pp.id
         WHERE ps.status = 'active' AND pp.plan_type = 'yearly'),
        (SELECT COUNT(*) FROM public.premium_subscriptions ps
         JOIN public.premium_plans pp ON ps.plan_id = pp.id
         WHERE ps.status = 'active' AND pp.plan_type = 'lifetime'),
        (SELECT COALESCE(SUM(sp.amount_lamports), 0) FROM public.solana_payments sp
         WHERE sp.type = 'premium' AND sp.status = 'confirmed'),
        (SELECT COUNT(DISTINCT user_id) FROM public.premium_subscriptions WHERE status = 'active'),
        (SELECT COUNT(*) FROM public.premium_subscriptions
         WHERE status = 'active'
         AND expires_at IS NOT NULL
         AND expires_at <= NOW() + INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Function to validate premium feature access
CREATE OR REPLACE FUNCTION validate_premium_access(
    p_user_id UUID,
    p_feature_name VARCHAR(100)
)
RETURNS TABLE(
    has_access BOOLEAN,
    subscription_status VARCHAR(20),
    feature_included BOOLEAN,
    expires_at TIMESTAMP WITH TIME ZONE,
    plan_type VARCHAR(20)
) AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- Get active subscription
    SELECT ps.status, ps.expires_at, ps.features, pp.plan_type
    INTO subscription_record
    FROM public.premium_subscriptions ps
    JOIN public.premium_plans pp ON ps.plan_id = pp.id
    WHERE ps.user_id = p_user_id
    AND ps.status = 'active'
    ORDER BY ps.created_at DESC
    LIMIT 1;

    -- If no subscription found
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'none'::VARCHAR(20), false, NULL::TIMESTAMP WITH TIME ZONE, NULL::VARCHAR(20);
        RETURN;
    END IF;

    -- Check if subscription is expired
    IF subscription_record.expires_at IS NOT NULL AND subscription_record.expires_at <= NOW() THEN
        RETURN QUERY SELECT false, 'expired'::VARCHAR(20), false, subscription_record.expires_at, subscription_record.plan_type;
        RETURN;
    END IF;

    -- Check if feature is included
    IF subscription_record.features ? p_feature_name THEN
        RETURN QUERY SELECT true, subscription_record.status, true, subscription_record.expires_at, subscription_record.plan_type;
    ELSE
        RETURN QUERY SELECT false, subscription_record.status, false, subscription_record.expires_at, subscription_record.plan_type;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_premium_audit_log(
    p_user_id UUID,
    p_subscription_id UUID,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_old_values JSONB,
    p_new_values JSONB,
    p_success BOOLEAN,
    p_error_message TEXT,
    p_severity VARCHAR(20),
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    audit_log_id UUID;
BEGIN
    INSERT INTO public.premium_audit_logs (
        user_id,
        subscription_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        success,
        error_message,
        severity,
        metadata
    ) VALUES (
        p_user_id,
        p_subscription_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_success,
        p_error_message,
        p_severity,
        p_metadata
    ) RETURNING id INTO audit_log_id;

    RETURN audit_log_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user_profiles when premium subscription changes
CREATE OR REPLACE FUNCTION update_user_premium_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile based on subscription status
    IF NEW.status = 'active' THEN
        UPDATE public.user_profiles
        SET
            is_premium = true,
            premium_expires_at = NEW.expires_at,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    ELSIF NEW.status IN ('expired', 'cancelled') THEN
        UPDATE public.user_profiles
        SET
            is_premium = false,
            premium_expires_at = NULL,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic user profile updates
DROP TRIGGER IF EXISTS trigger_update_user_premium_status ON public.premium_subscriptions;
CREATE TRIGGER trigger_update_user_premium_status
    AFTER INSERT OR UPDATE ON public.premium_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_premium_status();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION upsert_premium_feature_usage TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION get_premium_subscription_with_plan TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_feature_usage TO authenticated;
GRANT EXECUTE ON FUNCTION validate_premium_access TO authenticated;
GRANT EXECUTE ON FUNCTION create_premium_audit_log TO authenticated;

-- Grant admin functions to service role
GRANT EXECUTE ON FUNCTION expire_premium_subscriptions TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_premium_records TO service_role;
GRANT EXECUTE ON FUNCTION get_premium_statistics TO service_role;