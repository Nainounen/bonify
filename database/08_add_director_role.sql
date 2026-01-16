-- Add 'director' to employee_role enum
DO $$
BEGIN
    ALTER TYPE employee_role ADD VALUE IF NOT EXISTS 'director';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS for director on all relevant tables

-- Director can view/manage regions
CREATE POLICY "Director can manage regions" ON regions
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM employees WHERE role::text = 'director'
    )
  );

-- Director can view all sales
CREATE POLICY "Director can view all sales" ON sales
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM employees WHERE role::text = 'director'
    )
  );

-- Director can view and update all employees
CREATE POLICY "Director can manage employees" ON employees
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM employees WHERE role::text = 'director'
    )
  );

-- Director can view all shops
CREATE POLICY "Director can view all shops" ON shops
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM employees WHERE role::text = 'director'
    )
  );

-- How to create the first Director user:
-- 1. Sign up/create a user in the Auth UI or via normal signup page.
-- 2. Run this SQL in Supabase SQL Editor (replace EMAIL with the user's email):
-- UPDATE employees SET role = 'director' WHERE email = 'YOUR_DIRECTOR_EMAIL';
