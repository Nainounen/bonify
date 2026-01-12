ALTER TABLE monthly_targets
ADD COLUMN IF NOT EXISTS shop_manager_ytd_percentage INTEGER DEFAULT 0 CHECK (shop_manager_ytd_percentage >= 0);