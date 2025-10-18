-- ========================================
-- RPC: ACTIVATE PREMIUM SUBSCRIPTION
-- ========================================

CREATE OR REPLACE FUNCTION activate_premium_atomic(
  p_user_id UUID,
  p_subscription_id TEXT,
  p_product_id TEXT,
  p_purchase_date TIMESTAMPTZ,
  p_expiration_date TIMESTAMPTZ,
  p_original_transaction_id TEXT,
  p_store TEXT DEFAULT 'app_store',
  p_is_trial BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_existing_sub RECORD;
BEGIN
  SELECT * INTO v_existing_sub
  FROM premium_subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_existing_sub.id IS NOT NULL THEN
    UPDATE premium_subscriptions
    SET
      subscription_id = p_subscription_id,
      product_id = p_product_id,
      is_active = true,
      started_at = COALESCE(started_at, p_purchase_date),
      expires_at = p_expiration_date,
      original_transaction_id = p_original_transaction_id,
      auto_renew_enabled = true,
      store = p_store,
      is_trial = p_is_trial,
      trial_started_at = CASE WHEN p_is_trial THEN p_purchase_date ELSE trial_started_at END,
      billing_issues_detected_at = NULL,
      grace_period_expires_at = NULL,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    v_result = jsonb_build_object(
      'success', true,
      'action', 'updated',
      'user_id', p_user_id,
      'subscription_id', p_subscription_id
    );
  ELSE
    INSERT INTO premium_subscriptions (
      user_id,
      subscription_id,
      product_id,
      is_active,
      started_at,
      expires_at,
      original_transaction_id,
      auto_renew_enabled,
      store,
      is_trial,
      trial_started_at
    ) VALUES (
      p_user_id,
      p_subscription_id,
      p_product_id,
      true,
      p_purchase_date,
      p_expiration_date,
      p_original_transaction_id,
      true,
      p_store,
      p_is_trial,
      CASE WHEN p_is_trial THEN p_purchase_date ELSE NULL END
    );

    v_result = jsonb_build_object(
      'success', true,
      'action', 'created',
      'user_id', p_user_id
    );
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
