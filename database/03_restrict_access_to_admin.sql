-- Revert the "allow all" policies and implement admin-only access for viewing all data
-- Employees Table
DROP POLICY IF EXISTS "Authenticated users can view all employees" ON employees;

DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;

DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON employees;

CREATE POLICY "Users can view own profile or admin can view all" ON employees FOR
SELECT
  TO authenticated USING (
    auth.uid () = id
    OR (auth.jwt () - > > 'email') = 'list@admin.com'
  );

-- Sales Table
DROP POLICY IF EXISTS "Authenticated users can view all sales" ON sales;

DROP POLICY IF EXISTS "Users can view their own sales" ON sales;

DROP POLICY IF EXISTS "Users can view own sales or admin can view all" ON sales;

CREATE POLICY "Users can view own sales or admin can view all" ON sales FOR
SELECT
  TO authenticated USING (
    auth.uid () = employee_id
    OR (auth.jwt () - > > 'email') = 'list@admin.com'
  );