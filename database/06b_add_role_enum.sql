-- Add 'regional_manager' to employee_role enum
-- This migration runs separately to avoid "unsafe use of new value" errors in transactions
-- Run this BEFORE 07_add_regions_and_roles.sql

DO $$
BEGIN
    ALTER TYPE employee_role ADD VALUE IF NOT EXISTS 'regional_manager';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
