-- Function to generate random sales
-- Usage: Copy this entire script into your Supabase SQL Editor and run it.

CREATE OR REPLACE FUNCTION generate_random_sales_for_testing()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    -- List of emails to generate sales for
    target_emails text[] := ARRAY[
        'frick@admin.com', 
        'frickemp1@emp.com', 
        'frickemp2@emp.com', 
        'frickemp3@emp.com', 
        'frickemp4@emp.com'
    ];
    emp_email text;
    emp_id uuid;
    i integer;
    random_category text;
    sales_count integer;
    current_year integer := EXTRACT(YEAR FROM NOW());
    current_month integer := EXTRACT(MONTH FROM NOW());
BEGIN
    FOREACH emp_email IN ARRAY target_emails
    LOOP
        -- Find the employee ID (case-insensitive search)
        SELECT id INTO emp_id FROM employees WHERE email ILIKE emp_email;
        
        IF emp_id IS NOT NULL THEN
            -- Generate a random number of sales (between 5 and 25)
            sales_count := floor(random() * 20 + 5)::int;
            
            RAISE NOTICE 'Generating % sales for %', sales_count, emp_email;
            
            FOR i IN 1..sales_count
            LOOP
                -- Randomly pick Wireless (60% chance) or Wireline (40% chance)
                IF random() < 0.6 THEN
                    random_category := 'Wireless';
                ELSE
                    random_category := 'Wireline';
                END IF;
                
                -- Insert the sale
                INSERT INTO sales (employee_id, category, created_at, year, month)
                VALUES (
                    emp_id, 
                    random_category::sale_category, 
                    -- Random timestamp within the last 28 days to populate charts
                    NOW() - (floor(random() * 28) || ' days')::interval,
                    current_year,
                    current_month
                );
            END LOOP;
        ELSE
            RAISE NOTICE 'Employee not found: %', emp_email;
        END IF;
    END LOOP;
END;
$$;

-- Execute the function
SELECT generate_random_sales_for_testing();

-- Clean up (optional)
-- DROP FUNCTION generate_random_sales_for_testing();
