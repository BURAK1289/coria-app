-- ========================================
-- HOTFIX PART 1: ADD MISSING COLUMNS
-- ========================================

DO $$
BEGIN
  -- Add subscription_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN subscription_id TEXT;
  END IF;

  -- Add subscription_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'subscription_type'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN subscription_type TEXT;
  END IF;

  -- Add original_transaction_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'original_transaction_id'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN original_transaction_id TEXT;
  END IF;

  -- Add auto_renew_enabled if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'auto_renew_enabled'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN auto_renew_enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add billing_issues_detected_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'billing_issues_detected_at'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN billing_issues_detected_at TIMESTAMPTZ;
  END IF;

  -- Add grace_period_expires_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'grace_period_expires_at'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN grace_period_expires_at TIMESTAMPTZ;
  END IF;

  -- Add cancellation_reason if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN cancellation_reason TEXT;
  END IF;

  -- Add store if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'store'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN store TEXT;
  END IF;

  -- Add product_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'product_id'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN product_id TEXT;
  END IF;

  -- Add is_trial if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'is_trial'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN is_trial BOOLEAN DEFAULT false;
  END IF;

  -- Add trial_started_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN trial_started_at TIMESTAMPTZ;
  END IF;

  -- Add refunded_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'refunded_at'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN refunded_at TIMESTAMPTZ;
  END IF;

  -- Add refund_reason if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'premium_subscriptions'
    AND column_name = 'refund_reason'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN refund_reason TEXT;
  END IF;

END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_premium_subs_subscription_id ON premium_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_premium_subs_original_tx ON premium_subscriptions(original_transaction_id);
CREATE INDEX IF NOT EXISTS idx_premium_subs_store ON premium_subscriptions(store);
CREATE INDEX IF NOT EXISTS idx_premium_subs_grace_period ON premium_subscriptions(grace_period_expires_at) WHERE grace_period_expires_at IS NOT NULL;
