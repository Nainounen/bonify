-- SQL Skript um Verkaufsdaten (Sales) für die Frick-Mitarbeiter in die Vergangenheit zu simulieren
-- Zeitspanne: Letzte 6 Monate
-- Ziel: Testen der Historien-Funktion

DO $$
DECLARE
    -- Die E-Mail-Adressen der Mitarbeiter
    target_emails text[] := ARRAY['frickemp1@emp.com', 'frickemp2@emp.com', 'frickemp3@emp.com', 'frickemp4@emp.com'];
    emp_record RECORD;
    curr_date timestamp;
    sales_year integer;
    sales_month integer;
    num_wireless integer;
    num_wireline integer;
BEGIN
    -- Wir loopen über die letzten 6 Monate (inklusive aktuellem Monat)
    FOR i IN 0..5 LOOP
        -- Datum berechnen (Heute minus i Monate)
        curr_date := NOW() - (i || ' months')::interval;
        sales_year := EXTRACT(YEAR FROM curr_date);
        sales_month := EXTRACT(MONTH FROM curr_date);

        -- Für jeden Mitarbeiter in der Liste
        FOR emp_record IN SELECT id, email FROM employees WHERE email = ANY(target_emails) LOOP
            
            -- Zufällige Anzahl Wireless Sales (zwischen 5 und 25)
            num_wireless := floor(random() * 20 + 5)::int;
            
            FOR j IN 1..num_wireless LOOP
                INSERT INTO sales (employee_id, category, year, month, created_at)
                VALUES (
                    emp_record.id, 
                    'Wireless', 
                    sales_year, 
                    sales_month, 
                    -- Zufälliger Tag im jeweiligen Monat
                    make_timestamp(sales_year, sales_month, 1, 0, 0, 0) + (random() * (interval '27 days'))
                );
            END LOOP;

            -- Zufällige Anzahl Wireline Sales (zwischen 3 und 15)
            num_wireline := floor(random() * 12 + 3)::int;
            
            FOR k IN 1..num_wireline LOOP
                INSERT INTO sales (employee_id, category, year, month, created_at)
                VALUES (
                    emp_record.id, 
                    'Wireline', 
                    sales_year, 
                    sales_month, 
                     -- Zufälliger Tag im jeweiligen Monat
                    make_timestamp(sales_year, sales_month, 1, 0, 0, 0) + (random() * (interval '27 days'))
                );
            END LOOP;

            RAISE NOTICE 'Generiert: % Wireless, % Wireline für % in Monat %/%', num_wireless, num_wireline, emp_record.email, sales_month, sales_year;
            
        END LOOP;
    END LOOP;
END $$;
