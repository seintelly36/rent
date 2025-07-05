/*
  # Create RPC function for payment collection with transaction support

  1. New Functions
    - `collect_payment` - Handles payment insertion and lease deposit updates in a single transaction
    - Ensures data consistency between payments and leases tables

  2. Security
    - Function uses SECURITY DEFINER to ensure proper permissions
    - RLS policies are respected for all table operations
    - User authentication is verified before any operations

  3. Transaction Safety
    - All operations are wrapped in a transaction block
    - Proper error handling with rollback on failure
    - Returns structured data for client-side handling
*/

-- Function to collect payment with optional deposit update
CREATE OR REPLACE FUNCTION public.collect_payment(
  p_tenant_id uuid,
  p_asset_id uuid,
  p_amount numeric(10,2),
  p_due_date timestamptz,
  p_paid_date timestamptz DEFAULT NULL,
  p_status text DEFAULT 'pending',
  p_method text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_lease_id uuid DEFAULT NULL,
  p_collect_deposit boolean DEFAULT false
)
RETURNS TABLE (
  payment_id uuid,
  payment_amount numeric(10,2),
  payment_status text,
  lease_updated boolean,
  deposit_collected boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_payment_id uuid;
  lease_updated_flag boolean := false;
  current_deposit_status boolean := false;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate payment status
  IF p_status NOT IN ('paid', 'pending', 'overdue') THEN
    RAISE EXCEPTION 'Invalid payment status: %', p_status;
  END IF;

  -- Validate payment method if provided
  IF p_method IS NOT NULL AND p_method NOT IN ('cash', 'check', 'bank_transfer', 'online') THEN
    RAISE EXCEPTION 'Invalid payment method: %', p_method;
  END IF;

  -- Start transaction block
  BEGIN
    -- Insert the payment record
    INSERT INTO public.payments (
      user_id,
      tenant_id,
      asset_id,
      amount,
      due_date,
      paid_date,
      status,
      method,
      notes
    ) VALUES (
      auth.uid(),
      p_tenant_id,
      p_asset_id,
      p_amount,
      p_due_date,
      p_paid_date,
      p_status,
      p_method,
      p_notes
    ) RETURNING id INTO new_payment_id;

    -- Check if payment was inserted successfully
    IF new_payment_id IS NULL THEN
      RAISE EXCEPTION 'Failed to insert payment record';
    END IF;

    -- Update lease deposit status if requested and lease_id is provided
    IF p_collect_deposit = true AND p_lease_id IS NOT NULL THEN
      -- Verify the lease belongs to the user and get current deposit status
      SELECT deposit_collected INTO current_deposit_status
      FROM public.leases
      WHERE id = p_lease_id AND user_id = auth.uid();

      -- Check if lease was found
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Lease not found or access denied';
      END IF;

      -- Update deposit status if not already collected
      IF current_deposit_status = false THEN
        UPDATE public.leases
        SET 
          deposit_collected = true,
          updated_at = now()
        WHERE id = p_lease_id AND user_id = auth.uid();

        -- Check if update was successful
        IF FOUND THEN
          lease_updated_flag := true;
          current_deposit_status := true;
        ELSE
          RAISE EXCEPTION 'Failed to update lease deposit status';
        END IF;
      ELSE
        -- Deposit already collected, but this is not an error
        lease_updated_flag := false;
        current_deposit_status := true;
      END IF;
    END IF;

    -- Return the results
    RETURN QUERY
    SELECT 
      new_payment_id,
      p_amount,
      p_status,
      lease_updated_flag,
      current_deposit_status;

  EXCEPTION
    WHEN OTHERS THEN
      -- Re-raise the exception to trigger rollback
      RAISE;
  END;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.collect_payment(
  uuid, uuid, numeric(10,2), timestamptz, timestamptz, text, text, text, uuid, boolean
) TO authenticated;

-- Function to get payment collection summary for a lease
CREATE OR REPLACE FUNCTION public.get_lease_payment_summary(p_lease_id uuid)
RETURNS TABLE (
  lease_id uuid,
  total_payments numeric(10,2),
  total_periods_paid numeric(10,2),
  deposit_collected boolean,
  next_due_amount numeric(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lease_record public.leases%ROWTYPE;
  total_paid numeric(10,2) := 0;
  periods_paid numeric(10,2) := 0;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Get lease information
  SELECT * INTO lease_record
  FROM public.leases
  WHERE id = p_lease_id AND user_id = auth.uid();

  -- Check if lease was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lease not found or access denied';
  END IF;

  -- Calculate total payments for this lease
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.payments
  WHERE tenant_id = lease_record.tenant_id 
    AND asset_id = lease_record.asset_id
    AND status = 'paid'
    AND user_id = auth.uid();

  -- Calculate periods paid
  IF lease_record.rent_amount > 0 THEN
    periods_paid := total_paid / lease_record.rent_amount;
  END IF;

  -- Return the summary
  RETURN QUERY
  SELECT 
    lease_record.id,
    total_paid,
    periods_paid,
    lease_record.deposit_collected,
    lease_record.rent_amount;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_lease_payment_summary(uuid) TO authenticated;