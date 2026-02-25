-- SUPPORT FOR MIXED PAYMENTS
-- Run this in Supabase SQL Editor

-- 1. Updates for 'sales' table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cash_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS card_amount DECIMAL(15, 2) DEFAULT 0;

-- 2. Updates for 'beauty_services' table
ALTER TABLE beauty_services ADD COLUMN IF NOT EXISTS cash_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE beauty_services ADD COLUMN IF NOT EXISTS card_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE beauty_services ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH';

-- 3. Updates for 'service_packages' table (if needed, though usually paid at once)
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS cash_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS card_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH';
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS price DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS cash_session_id BIGINT;
