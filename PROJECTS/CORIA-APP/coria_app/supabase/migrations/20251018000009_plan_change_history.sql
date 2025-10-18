-- ========================================
-- HOTFIX PART 3: PLAN CHANGE HISTORY
-- ========================================

CREATE TABLE IF NOT EXISTS plan_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  old_product_id TEXT,
  new_product_id TEXT NOT NULL,
  change_type TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revenuecat_event_id TEXT,
  CONSTRAINT valid_change_type CHECK (
    change_type IN ('upgrade', 'downgrade', 'resubscribe', 'initial')
  )
);

CREATE INDEX IF NOT EXISTS idx_plan_changes_user ON plan_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_changes_subscription ON plan_change_history(subscription_id);

ALTER TABLE plan_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan changes"
  ON plan_change_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage plan changes"
  ON plan_change_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
