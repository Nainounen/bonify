-- Migration: New Top Seller Incentive Bonus System
-- This migration replaces the tier-based bonus system with a ZER-based monthly evaluation system

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old policies first
DROP POLICY IF EXISTS "Authenticated users can view bonus tiers" ON bonus_tiers;
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Admin can view all sales" ON sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
DROP POLICY IF EXISTS "Admin can delete all sales" ON sales;
DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;
DROP POLICY IF EXISTS "Admin can view all employee records" ON employees;
DROP POLICY IF EXISTS "Users can insert their own employee record" ON employees;
DROP POLICY IF EXISTS "Users can update their own employee record" ON employees;

-- Drop old tables
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS bonus_tiers CASCADE;

-- Create shops table
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee role enum
CREATE TYPE employee_role AS ENUM ('internal_sales', 'external_sales', 'shop_manager');

-- Update employees table
ALTER TABLE employees 
  ADD COLUMN role employee_role DEFAULT 'internal_sales',
  ADD COLUMN employment_percentage INTEGER DEFAULT 100 CHECK (employment_percentage > 0 AND employment_percentage <= 100),
  ADD COLUMN shop_id UUID REFERENCES shops(id) ON DELETE SET NULL;

-- Create monthly_targets table
CREATE TABLE monthly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2100),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  wireless_target INTEGER NOT NULL CHECK (wireless_target >= 0),
  wireline_target INTEGER NOT NULL CHECK (wireline_target >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year, month)
);

-- Create category enum
CREATE TYPE sale_category AS ENUM ('Wireless', 'Wireline');

-- Create new sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  category sale_category NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create monthly_bonuses table (calculated results)
CREATE TABLE monthly_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  wireless_count INTEGER DEFAULT 0,
  wireline_count INTEGER DEFAULT 0,
  wireless_zer_percentage DECIMAL(5, 2) DEFAULT 0,
  wireline_zer_percentage DECIMAL(5, 2) DEFAULT 0,
  level1_wireless_orders INTEGER DEFAULT 0,
  level1_wireline_orders INTEGER DEFAULT 0,
  level2_wireless_orders INTEGER DEFAULT 0,
  level2_wireline_orders INTEGER DEFAULT 0,
  total_bonus_amount DECIMAL(10, 2) DEFAULT 0,
  capped_bonus_amount DECIMAL(10, 2) DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  paid BOOLEAN DEFAULT FALSE,
  UNIQUE(employee_id, year, month)
);

-- Create indexes for performance
CREATE INDEX sales_employee_id_idx ON sales(employee_id);
CREATE INDEX sales_year_month_idx ON sales(year, month);
CREATE INDEX sales_created_at_idx ON sales(created_at DESC);
CREATE INDEX monthly_targets_employee_year_month_idx ON monthly_targets(employee_id, year, month);
CREATE INDEX monthly_bonuses_employee_year_month_idx ON monthly_bonuses(employee_id, year, month);
CREATE INDEX employees_shop_id_idx ON employees(shop_id);

-- Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees (updated)
CREATE POLICY "Users can view their own employee record"
  ON employees FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all employee records"
  ON employees FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Users can insert their own employee record"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own employee record"
  ON employees FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can update all employee records"
  ON employees FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- RLS Policies for shops
CREATE POLICY "Authenticated users can view shops"
  ON shops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage shops"
  ON shops FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- RLS Policies for sales (updated)
CREATE POLICY "Users can view their own sales"
  ON sales FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Admin can view all sales"
  ON sales FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Users can insert their own sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admin can delete all sales"
  ON sales FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- RLS Policies for monthly_targets
CREATE POLICY "Users can view their own targets"
  ON monthly_targets FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Admin can view all targets"
  ON monthly_targets FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Admin can manage all targets"
  ON monthly_targets FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- RLS Policies for monthly_bonuses
CREATE POLICY "Users can view their own bonuses"
  ON monthly_bonuses FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Admin can view all bonuses"
  ON monthly_bonuses FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Admin can manage all bonuses"
  ON monthly_bonuses FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.employees (id, email, name, role, employment_percentage)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'internal_sales',
    100
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample shops
INSERT INTO shops (name) VALUES
  ('Zurich Main'),
  ('Basel Center'),
  ('Geneva Downtown');

-- Note: Run this migration in your Supabase SQL Editor
-- After running, existing employees will need their role and employment_percentage set
-- Existing sales data will be lost (as per requirement to start fresh)
