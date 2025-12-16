-- Allow all authenticated users to view all employees
DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;

CREATE POLICY "Authenticated users can view all employees" ON employees FOR
SELECT
  TO authenticated USING (true);

-- Allow all authenticated users to view all sales
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;

CREATE POLICY "Authenticated users can view all sales" ON sales FOR
SELECT
  TO authenticated USING (true);