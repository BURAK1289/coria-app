-- ========================================
-- HOTFIX PART 2: WEBHOOK EVENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS revenuecat_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  subscription_id TEXT,
  transaction_id TEXT,
  event_payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  event_timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'INITIAL_PURCHASE',
      'RENEWAL',
      'CANCELLATION',
      'EXPIRATION',
      'BILLING_ISSUE',
      'REFUND',
      'PRODUCT_CHANGE',
      'UNCANCELLATION'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_user ON revenuecat_webhook_events(app_user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription ON revenuecat_webhook_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON revenuecat_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON revenuecat_webhook_events(processed_at) WHERE processed_at IS NULL;

ALTER TABLE revenuecat_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook events"
  ON revenuecat_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
