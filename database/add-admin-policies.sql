-- Migration: Add admin RLS policies
-- This script adds policies to allow admin@admin.com to view all data
-- Run this in your Supabase SQL Editor

-- Add admin policy for employees table
CREATE POLICY "Admin can view all employee records"
  ON employees FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Add admin policy for sales table (view all)
CREATE POLICY "Admin can view all sales"
  ON sales FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Add admin policy for sales table (delete all)
CREATE POLICY "Admin can delete all sales"
  ON sales FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');
