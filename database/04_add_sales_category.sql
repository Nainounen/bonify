-- Add category column to sales table
ALTER TABLE sales
ADD COLUMN category TEXT NOT NULL DEFAULT 'Internet';

-- Update existing sales to have a default category (already handled by DEFAULT, but good to be explicit if needed)
-- UPDATE sales SET category = 'Internet' WHERE category IS NULL;