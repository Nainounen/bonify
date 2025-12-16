-- Migration: Add read-only leaderboard access for all authenticated users
-- This allows any authenticated user to view employee names, sales counts, and tier information
-- for displaying the leaderboard, without giving write access

-- Allow all authenticated users to read employee data (name, email only - needed for leaderboard)
CREATE POLICY "All users can view employee names for leaderboard"
  ON employees FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read sales data (needed to calculate leaderboard stats)
-- This is read-only - users can only view sales, not modify them
CREATE POLICY "All users can view sales for leaderboard"
  ON sales FOR SELECT
  USING (auth.role() = 'authenticated');

-- Note: Existing policies for users to manage their own data remain in place
-- This only adds read access to view other users' data for leaderboard purposes
