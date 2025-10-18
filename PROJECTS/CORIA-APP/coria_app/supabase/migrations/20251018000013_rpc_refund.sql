CREATE OR REPLACE FUNCTION refund_premium_atomic(
  p_user_id UUID,
  p_refunded_at TIMESTAMPTZ DEFAULT NOW(),
  p_refund_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_sub RECORD;
BEGIN
  SELECT * INTO v_existing_sub FROM premium_subscriptions WHERE user_id = p_user_id FOR UPDATE;
  IF v_existing_sub.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No subscription found');
  END IF;
  UPDATE premium_subscriptions SET is_active = false, refunded_at = p_refunded_at, refund_reason = p_refund_reason, auto_renew_enabled = false, updated_at = NOW() WHERE user_id = p_user_id;
  RETURN jsonb_build_object('success', true, 'action', 'refunded', 'user_id', p_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
