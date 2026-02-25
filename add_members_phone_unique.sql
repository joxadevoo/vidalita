-- Add unique constraint to members phone column
-- Run this in Supabase SQL Editor

-- First, ensure no nulls or empty strings cause issues if they're meant to be unique (though unique allows multiple nulls)
-- If there are already duplicates, this script will fail. 
-- The user might need to clean up data first.

ALTER TABLE members ADD CONSTRAINT members_phone_key UNIQUE (phone);
