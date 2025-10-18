CREATE OR REPLACE FUNCTION resolve_grace_period_atomic(
  p_user_id UUID,
  p_resolution TEXT,
  p_resolved_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_sub RECORD;
BEGIN
  IF p_resolution NOT IN ('recovered', 'failed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid resolution type');
  END IF;
  SELECT * INTO v_existing_sub FROM premium_subscriptions WHERE user_id = p_user_id FOR UPDATE;
  IF v_existing_sub.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No subscription found');
  END IF;
  IF p_resolution = 'recovered' THEN
    UPDATE premium_subscriptions SET billing_issues_detected_at = NULL, grace_period_expires_at = NULL, is_active = true, auto_renew_enabled = true, updated_at = NOW() WHERE user_id = p_user_id;
    RETURN jsonb_build_object('success', true, 'action', 'grace_period_recovered', 'user_id', p_user_id);
  ELSE
    UPDATE premium_subscriptions SET is_active = false, auto_renew_enabled = false, expires_at = p_resolved_at, updated_at = NOW() WHERE user_id = p_user_id;
    RETURN jsonb_build_object('success', true, 'action', 'grace_period_failed', 'user_id', p_user_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
