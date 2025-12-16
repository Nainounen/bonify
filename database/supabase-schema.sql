-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bonus_tiers table
CREATE TABLE bonus_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contracts_required INTEGER NOT NULL,
  bonus_amount DECIMAL(10, 2) NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  "order" INTEGER NOT NULL UNIQUE
);

-- Create sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  bonus_tier_id INTEGER REFERENCES bonus_tiers(id)
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Users can view their own employee record"
  ON employees FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own employee record"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own employee record"
  ON employees FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for sales
CREATE POLICY "Users can view their own sales"
  ON sales FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Users can insert their own sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

-- RLS Policies for bonus_tiers (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view bonus tiers"
  ON bonus_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Insert default bonus tiers
INSERT INTO bonus_tiers (name, contracts_required, bonus_amount, color, icon, "order") VALUES
  ('Starter', 0, 0, '#94a3b8', 'Star', 1),
  ('Bronze', 5, 100, '#cd7f32', 'Award', 2),
  ('Silver', 15, 300, '#c0c0c0', 'Medal', 3),
  ('Gold', 30, 750, '#ffd700', 'Trophy', 4),
  ('Platinum', 50, 1500, '#e5e4e2', 'Crown', 5),
  ('Diamond', 100, 3500, '#b9f2ff', 'Gem', 6);

-- Create indexes for performance
CREATE INDEX sales_employee_id_idx ON sales(employee_id);
CREATE INDEX sales_created_at_idx ON sales(created_at DESC);

-- Create a function to automatically create employee record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.employees (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create employee record when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
