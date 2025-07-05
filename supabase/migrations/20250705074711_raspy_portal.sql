/*
  # Create adjust_lease_periods RPC function

  1. New Functions
    - `adjust_lease_periods` - Adjusts lease frequency and end date when periods are refunded/cancelled
    - Ensures lease frequency doesn't go below 1
    - Recalculates end date based on adjusted frequency

  2. Security
    - Function uses SECURITY DEFINER for proper RLS enforcement
    - Validates user ownership of lease
    - Proper error handling and validation

  3. Transaction Safety
    - Atomic operation with proper rollback on failure
    - Returns updated lease information
*/

-- Function to adjust lease periods (reduce frequency and recalculate end date)
CREATE OR REPLACE FUNCTION public.adjust_lease_periods(
  p_lease_id uuid,
  p_period_number integer,
  p_adjustment_type text
)
RETURNS TABLE (
  lease_id uuid,
  old_frequency integer,
  new_frequency integer,
  old_end_date timestamptz,
  new_end_date timestamptz,
  adjustment_applied boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lease_record public.leases%ROWTYPE;
  new_freq integer;
  new_end_date timestamptz;
  charge_period_minutes integer;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate adjustment type
  IF p_adjustment_type NOT IN ('refund', 'cancel') THEN
    RAISE EXCEPTION 'Invalid adjustment type: %', p_adjustment_type;
  END IF;

  -- Get lease information
  SELECT * INTO lease_record
  FROM public.leases
  WHERE id = p_lease_id AND user_id = auth.uid();

  -- Check if lease was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lease not found or access denied';
  END IF;

  -- Calculate new frequency (reduce by 1, but don't go below 1)
  new_freq := GREATEST(lease_record.frequency - 1, 1);
  
  -- If frequency is already 1, we can't reduce it further
  IF lease_record.frequency = 1 THEN
    -- Return without making changes
    RETURN QUERY
    SELECT 
      lease_record.id,
      lease_record.frequency,
      lease_record.frequency,
      lease_record.end_date,
      lease_record.end_date,
      false;
    RETURN;
  END IF;

  -- Get charge period minutes
  charge_period_minutes := lease_record.charge_period_minutes;

  -- Calculate new end date based on new frequency
  -- Add (new_frequency * charge_period_minutes) minutes to start_date
  new_end_date := lease_record.start_date + (new_freq * charge_period_minutes * INTERVAL '1 minute');

  -- Update the lease
  UPDATE public.leases
  SET 
    frequency = new_freq,
    end_date = new_end_date,
    updated_at = now()
  WHERE id = p_lease_id AND user_id = auth.uid();

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update lease';
  END IF;

  -- Return the results
  RETURN QUERY
  SELECT 
    lease_record.id,
    lease_record.frequency,
    new_freq,
    lease_record.end_date,
    new_end_date,
    true;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.adjust_lease_periods(uuid, integer, text) TO authenticated;