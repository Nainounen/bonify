-- =====================================================
-- RESET USER DATA (Keep User Account)
-- =====================================================
-- This script deletes all sales data for a specific user
-- but keeps the user account and employee record intact.
-- 
-- Use this for testing or to reset an employee's progress.
-- =====================================================

-- OPTION 1: Delete data for a SPECIFIC user by email
-- Replace 'user@example.com' with the actual email
DELETE FROM sales 
WHERE employee_id = (
  SELECT id FROM employees WHERE email = 'user@example.com'
);

-- OPTION 2: Delete data for a SPECIFIC user by ID
-- Replace 'user-uuid-here' with the actual user ID
-- DELETE FROM sales 
-- WHERE employee_id = 'user-uuid-here';

-- OPTION 3: Delete ALL sales data for ALL users (DANGEROUS!)
-- Uncomment only if you want to reset EVERYONE
-- DELETE FROM sales;

-- OPTION 4: Delete audit logs for a specific user (if using enhanced schema)
-- DELETE FROM audit_log 
-- WHERE employee_id = (
--   SELECT id FROM employees WHERE email = 'user@example.com'
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check remaining sales for user
-- SELECT COUNT(*) as remaining_sales 
-- FROM sales 
-- WHERE employee_id = (
--   SELECT id FROM employees WHERE email = 'user@example.com'
-- );

-- Verify user still exists
-- SELECT id, email, name, created_at 
-- FROM employees 
-- WHERE email = 'user@example.com';

-- =====================================================
-- NOTES
-- =====================================================
-- ✅ User account remains (can still login)
-- ✅ Employee record remains in database
-- ✅ Bonus tiers remain unchanged
-- ❌ All sales history is deleted
-- ❌ Cannot be undone (unless you have backups)
-- 
-- SAFETY: This only affects the specified user's data
-- due to the WHERE clause filtering by employee_id
-- =====================================================
