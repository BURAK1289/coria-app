CREATE OR REPLACE FUNCTION cancel_premium_atomic(
  p_user_id UUID,
  p_cancellation_reason TEXT DEFAULT NULL,
  p_cancelled_at TIMESTAMPTZ DEFAULT NOW()
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
  UPDATE premium_subscriptions SET auto_renew_enabled = false, cancellation_reason = p_cancellation_reason, updated_at = NOW() WHERE user_id = p_user_id;
  RETURN jsonb_build_object('success', true, 'action', 'cancelled', 'user_id', p_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
