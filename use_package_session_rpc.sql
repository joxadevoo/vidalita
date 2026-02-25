-- Create RPC for atomic session decrement
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION use_package_session_atomic(
  p_package_id BIGINT,
  p_member_id BIGINT,
  p_service_name TEXT,
  p_staff_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining_sessions INT;
  v_result JSONB;
BEGIN
  -- 1. Check current sessions and lock the row
  SELECT remaining_sessions INTO v_remaining_sessions
  FROM beauty_member_packages
  WHERE id = p_package_id AND member_id = p_member_id
  FOR UPDATE;

  IF v_remaining_sessions IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Package not found');
  END IF;

  IF v_remaining_sessions <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No sessions remaining in this package');
  END IF;

  -- 2. Decrement sessions
  UPDATE beauty_member_packages
  SET remaining_sessions = remaining_sessions - 1,
      updated_at = NOW()
  WHERE id = p_package_id;

  -- 3. Log usage (optional, if you have a usage log table)
  -- INSERT INTO beauty_package_usage (package_id, service_date, service_name, staff_name)
  -- VALUES (p_package_id, NOW(), p_service_name, p_staff_name);

  RETURN jsonb_build_object(
    'success', true, 
    'remaining_sessions', v_remaining_sessions - 1
  );
END;
$$;
