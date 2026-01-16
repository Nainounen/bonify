-- Fix for Infinite Recursion in RLS Policies
-- This script creates security definer functions to safely retrieve user attributes 
-- without triggering RLS policies recursively.

-- 1. Create helper function to get current user's role safely
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS employee_role AS $$
BEGIN
  RETURN (SELECT role FROM employees WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create helper function to get current user's shop_id safely
CREATE OR REPLACE FUNCTION get_my_shop_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT shop_id FROM employees WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop potentially problematic policies on employees
DROP POLICY IF EXISTS "Shop Managers can view their shop employees" ON employees;
DROP POLICY IF EXISTS "Regional Managers can view their region employees" ON employees;

-- 4. Recreate Shop Manager policy using the safe function
CREATE POLICY "Shop Managers can view their shop employees"
ON employees
FOR SELECT
USING (
  (get_my_role() = 'shop_manager' AND shop_id = get_my_shop_id())
  OR
  id = auth.uid() -- Always allow self
);

-- 5. Ensure basic policies exist (re-run just in case)
DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;
CREATE POLICY "Users can view their own employee record"
  ON employees FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all employee records" ON employees;
CREATE POLICY "Admin can view all employee records"
  ON employees FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- 6. Ensure Sales policies are safe
DROP POLICY IF EXISTS "Shop Managers can view their shop sales" ON sales;
CREATE POLICY "Shop Managers can view their shop sales"
ON sales
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE shop_id = get_my_shop_id()
  )
);
