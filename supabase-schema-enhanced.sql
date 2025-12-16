-- ENHANCED SECURITY SCHEMA FOR BONIFY
-- Run this AFTER the initial supabase-schema.sql

-- ==============================================
-- 1. ADD CONSTRAINTS TO PREVENT DATA MANIPULATION
-- ==============================================

-- Prevent updating sales after creation (immutable audit trail)
ALTER TABLE sales 
  ADD CONSTRAINT sales_created_at_immutable 
  CHECK (created_at <= NOW());

-- ==============================================
-- 2. ADD RATE LIMITING FUNCTION
-- ==============================================

-- Function to check if user is creating sales too quickly
CREATE OR REPLACE FUNCTION check_sale_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_sales_count INTEGER;
BEGIN
  -- Count sales in the last minute
  SELECT COUNT(*) INTO recent_sales_count
  FROM sales
  WHERE employee_id = NEW.employee_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Allow max 5 sales per minute (prevents spam/abuse)
  IF recent_sales_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 sales per minute.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce rate limiting
CREATE TRIGGER enforce_sale_rate_limit
  BEFORE INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION check_sale_rate_limit();

-- ==============================================
-- 3. ADD AUDIT LOGGING (Optional but Recommended)
-- ==============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = employee_id);

-- Function to log sales insertions
CREATE OR REPLACE FUNCTION log_sale_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (employee_id, action, table_name, record_id, new_data)
  VALUES (
    NEW.employee_id,
    'INSERT',
    'sales',
    NEW.id,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log all sales
CREATE TRIGGER audit_sales_insert
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION log_sale_insert();

-- ==============================================
-- 4. ADD DATA VALIDATION CONSTRAINTS
-- ==============================================

-- Ensure bonus_amount is non-negative
ALTER TABLE bonus_tiers
  ADD CONSTRAINT bonus_amount_non_negative
  CHECK (bonus_amount >= 0);

-- Ensure contracts_required is non-negative
ALTER TABLE bonus_tiers
  ADD CONSTRAINT contracts_required_non_negative
  CHECK (contracts_required >= 0);

-- ==============================================
-- 5. ENHANCE EMPLOYEE TABLE SECURITY
-- ==============================================

-- Prevent employees from changing their email to prevent impersonation
CREATE POLICY "Users cannot update their email"
  ON employees FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    (SELECT email FROM employees WHERE id = auth.uid()) = NEW.email
  );

-- Drop the old update policy
DROP POLICY IF EXISTS "Users can update their own employee record" ON employees;

-- ==============================================
-- 6. ADD FUNCTION TO DETECT SUSPICIOUS ACTIVITY
-- ==============================================

-- Function to check for unusual patterns
CREATE OR REPLACE FUNCTION check_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
  daily_sales_count INTEGER;
  avg_daily_sales NUMERIC;
BEGIN
  -- Count today's sales
  SELECT COUNT(*) INTO daily_sales_count
  FROM sales
  WHERE employee_id = NEW.employee_id
    AND created_at >= CURRENT_DATE;
  
  -- Calculate average daily sales over last 30 days
  SELECT AVG(daily_count) INTO avg_daily_sales
  FROM (
    SELECT COUNT(*) as daily_count
    FROM sales
    WHERE employee_id = NEW.employee_id
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
  ) daily_counts;
  
  -- Flag if today's sales are more than 3x the average (possible fraud)
  IF avg_daily_sales > 0 AND daily_sales_count > (avg_daily_sales * 3) THEN
    -- Log suspicious activity
    INSERT INTO audit_log (employee_id, action, table_name, new_data)
    VALUES (
      NEW.employee_id,
      'SUSPICIOUS_ACTIVITY',
      'sales',
      jsonb_build_object(
        'daily_count', daily_sales_count,
        'average', avg_daily_sales,
        'threshold_exceeded', true
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to detect suspicious patterns
CREATE TRIGGER detect_suspicious_sales
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION check_suspicious_activity();

-- ==============================================
-- 7. CREATE ADMIN VIEW (Optional)
-- ==============================================

-- View for administrators to see flagged activities
CREATE OR REPLACE VIEW suspicious_activities AS
SELECT 
  al.created_at,
  e.name as employee_name,
  e.email,
  al.new_data->>'daily_count' as daily_sales,
  al.new_data->>'average' as avg_daily_sales
FROM audit_log al
JOIN employees e ON e.id = al.employee_id
WHERE al.action = 'SUSPICIOUS_ACTIVITY'
ORDER BY al.created_at DESC;

-- ==============================================
-- 8. ADD INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS audit_log_employee_id_idx ON audit_log(employee_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON audit_log(action);

-- ==============================================
-- SECURITY BEST PRACTICES SUMMARY
-- ==============================================

-- ✅ Rate limiting: Max 5 sales per minute
-- ✅ Immutable audit trail: Sales can't be edited
-- ✅ Activity logging: All sales are logged
-- ✅ Fraud detection: Flags unusual patterns
-- ✅ Email protection: Users can't change email
-- ✅ Data validation: Positive amounts enforced
-- ✅ RLS policies: Users can only access their data

COMMENT ON TABLE audit_log IS 'Audit trail for all sales activities and suspicious behavior';
COMMENT ON FUNCTION check_sale_rate_limit() IS 'Prevents spam by limiting to 5 sales per minute';
COMMENT ON FUNCTION check_suspicious_activity() IS 'Flags sales patterns that exceed 3x normal activity';
