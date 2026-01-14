-- Create regions table
CREATE TABLE
  IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW ()
  );

-- Add region_id to shops
ALTER TABLE shops
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions (id) ON DELETE SET NULL;

-- Enable RLS on regions
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- Allow read access to regions for authenticated users
CREATE POLICY "Authenticated users can view regions" ON regions FOR
SELECT
  TO authenticated USING (true);

-- Add 'regional_manager' to employee_role enum
-- MOVED TO 06b_add_role_enum.sql to avoid transaction errors
-- Please run 06b_add_role_enum.sql before this file
-- Add region_id to employees (to link a Regional Manager to a Region)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions (id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS shops_region_id_idx ON shops (region_id);

CREATE INDEX IF NOT EXISTS employees_region_id_idx ON employees (region_id);

-- Update RLS policies for Regional Managers
-- Regional Managers can view all employees in their region (via shops)
CREATE POLICY "Regional Managers can view employees in their region" ON employees FOR
SELECT
  USING (
    auth.uid () IN (
      SELECT
        id
      FROM
        employees
      WHERE
        role::text = 'regional_manager'
        AND region_id IS NOT NULL
    )
    AND shop_id IN (
      SELECT
        id
      FROM
        shops
      WHERE
        region_id = (
          SELECT
            region_id
          FROM
            employees
          WHERE
            id = auth.uid ()
        )
    )
  );

-- Regional Managers can view all shops in their region
CREATE POLICY "Regional Managers can view shops in their region" ON shops FOR
SELECT
  USING (
    auth.uid () IN (
      SELECT
        id
      FROM
        employees
      WHERE
        role::text = 'regional_manager'
        AND region_id IS NOT NULL
    )
    AND region_id = (
      SELECT
        region_id
      FROM
        employees
      WHERE
        id = auth.uid ()
    )
  );

-- Regional Managers can view sales in their region
CREATE POLICY "Regional Managers can view sales in their region" ON sales FOR
SELECT
  USING (
    auth.uid () IN (
      SELECT
        id
      FROM
        employees
      WHERE
        role::text = 'regional_manager'
        AND region_id IS NOT NULL
    )
    AND employee_id IN (
      SELECT
        e.id
      FROM
        employees e
        JOIN shops s ON e.shop_id = s.id
      WHERE
        s.region_id = (
          SELECT
            region_id
          FROM
            employees
          WHERE
            id = auth.uid ()
        )
    )
  );