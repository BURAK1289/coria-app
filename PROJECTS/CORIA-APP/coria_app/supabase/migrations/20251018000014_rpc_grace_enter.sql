CREATE OR REPLACE FUNCTION enter_grace_period_atomic(
  p_user_id UUID,
  p_grace_period_days INTEGER DEFAULT 16,
  p_billing_issue_detected_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_sub RECORD;
  v_grace_expires_at TIMESTAMPTZ;
BEGIN
  v_grace_expires_at := p_billing_issue_detected_at + (p_grace_period_days || ' days')::INTERVAL;
  SELECT * INTO v_existing_sub FROM premium_subscriptions WHERE user_id = p_user_id FOR UPDATE;
  IF v_existing_sub.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No subscription found');
  END IF;
  UPDATE premium_subscriptions SET billing_issues_detected_at = p_billing_issue_detected_at, grace_period_expires_at = v_grace_expires_at, updated_at = NOW() WHERE user_id = p_user_id;
  RETURN jsonb_build_object('success', true, 'action', 'grace_period_started', 'user_id', p_user_id, 'grace_expires_at', v_grace_expires_at);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
