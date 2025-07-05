/*
  # Update collect_payment RPC function for deposit amount collection

  1. Function Changes
    - Change p_collect_deposit boolean to p_deposit_amount_to_collect numeric(10,2)
    - Update logic to handle partial deposit collection
    - Return new_deposit_collected_amount instead of boolean

  2. Security
    - Ensure collected amount doesn't exceed total deposit
    - Validate user permissions for all operations

  3. Data Integrity
    - Update deposit_collected boolean based on full collection
    - Track cumulative deposit collection amount
*/

-- Drop existing function to avoid conflicts
DROP FUNCTION IF EXISTS public.collect_payment(
  uuid, uuid, numeric(10,2), timestamptz, timestamptz, text, text, text, uuid, boolean
);

-- Updated function with deposit amount parameter
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
  p_deposit_amount_to_collect numeric(10,2) DEFAULT 0
)
RETURNS TABLE (
  payment_id uuid,
  payment_amount numeric(10,2),
  payment_status text,
  lease_updated boolean,
  new_deposit_collected_amount numeric(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_payment_id uuid;
  lease_updated_flag boolean := false;
  current_deposit_collected_amount numeric(10,2) := 0;
  lease_total_deposit numeric(10,2) := 0;
  new_total_collected_deposit numeric(10,2) := 0;
  final_collected_amount numeric(10,2) := 0;
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

  -- Validate deposit amount
  IF p_deposit_amount_to_collect < 0 THEN
    RAISE EXCEPTION 'Deposit amount to collect cannot be negative';
  END IF;

  -- Validate that tenant and asset belong to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = p_tenant_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Tenant not found or access denied';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.assets 
    WHERE id = p_asset_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Asset not found or access denied';
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

    -- Handle deposit collection if requested and lease_id is provided
    IF p_deposit_amount_to_collect > 0 AND p_lease_id IS NOT NULL THEN
      -- Get current deposit information
      SELECT deposit_collected_amount, deposit INTO current_deposit_collected_amount, lease_total_deposit
      FROM public.leases
      WHERE id = p_lease_id AND user_id = auth.uid();

      -- Check if lease was found
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Lease not found or access denied';
      END IF;

      -- Calculate new total collected deposit (ensure it doesn't exceed total deposit)
      new_total_collected_deposit := current_deposit_collected_amount + p_deposit_amount_to_collect;
      final_collected_amount := LEAST(new_total_collected_deposit, lease_total_deposit);

      -- Update lease deposit information
      UPDATE public.leases
      SET 
        deposit_collected_amount = final_collected_amount,
        deposit_collected = (final_collected_amount >= lease_total_deposit),
        updated_at = now()
      WHERE id = p_lease_id AND user_id = auth.uid();

      -- Check if update was successful
      IF FOUND THEN
        lease_updated_flag := true;
      ELSE
        RAISE EXCEPTION 'Failed to update lease deposit information';
      END IF;
    ELSE
      -- No deposit collection, get current amount for return value
      IF p_lease_id IS NOT NULL THEN
        SELECT deposit_collected_amount INTO final_collected_amount
        FROM public.leases
        WHERE id = p_lease_id AND user_id = auth.uid();
        
        IF NOT FOUND THEN
          final_collected_amount := 0;
        END IF;
      ELSE
        final_collected_amount := 0;
      END IF;
    END IF;

    -- Return the results
    RETURN QUERY
    SELECT 
      new_payment_id,
      p_amount,
      p_status,
      lease_updated_flag,
      final_collected_amount;

  EXCEPTION
    WHEN OTHERS THEN
      -- Re-raise the exception to trigger rollback
      RAISE;
  END;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.collect_payment(
  uuid, uuid, numeric(10,2), timestamptz, timestamptz, text, text, text, uuid, numeric(10,2)
) TO authenticated;