-- Create table for tracking session usages
CREATE TABLE IF NOT EXISTS package_session_usages (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT REFERENCES service_packages(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES members(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_date TIMESTAMPTZ DEFAULT NOW(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    cash_session_id BIGINT,
    staff_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: `beauty_member_packages` seems to be the old name. 
-- Assuming `service_packages` is the correct table now.
CREATE OR REPLACE FUNCTION use_package_session_atomic(
  p_package_id BIGINT,
  p_appointment_id UUID DEFAULT NULL,
  p_service_date TIMESTAMPTZ DEFAULT NOW(),
  p_cash_session_id BIGINT DEFAULT NULL,
  p_staff_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining_sessions INT;
  v_member_id BIGINT;
  v_service_name TEXT;
  v_result JSONB;
BEGIN
  -- 1. Check current sessions and lock the row
  SELECT remaining_sessions, member_id, service_name 
  INTO v_remaining_sessions, v_member_id, v_service_name
  FROM service_packages
  WHERE id = p_package_id
  FOR UPDATE;

  IF v_remaining_sessions IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Package not found');
  END IF;

  IF v_remaining_sessions <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'No sessions remaining in this package');
  END IF;

  -- 2. Decrement sessions
  UPDATE service_packages
  SET remaining_sessions = remaining_sessions - 1
  WHERE id = p_package_id;

  -- 3. Log usage
  INSERT INTO package_session_usages (package_id, member_id, service_name, service_date, appointment_id, cash_session_id, staff_name)
  VALUES (p_package_id, v_member_id, v_service_name, p_service_date, p_appointment_id, p_cash_session_id, p_staff_name);

  -- 4. Record as beauty service history
  INSERT INTO beauty_services (memberid, servicename, servicedate, amount, note, payment_method, cash_session_id)
  VALUES (v_member_id, v_service_name, p_service_date, 0, 'Used package session ' || (v_remaining_sessions - 1) || ' remaining', 'PACKAGE', p_cash_session_id);

  RETURN jsonb_build_object(
    'success', true, 
    'remaining_sessions', v_remaining_sessions - 1,
    'service_record', jsonb_build_object(
        'package_id', p_package_id,
        'remaining_sessions', v_remaining_sessions - 1
    )
  );
END;
$$;
