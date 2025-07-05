/*
  # Create leases table

  1. New Tables
    - `leases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `asset_id` (uuid, references assets)
      - `tenant_id` (uuid, references tenants)
      - `start_date` (date)
      - `end_date` (date)
      - `monthly_rent` (numeric)
      - `deposit` (numeric)
      - `status` (text with check constraint)
      - `lease_type` (text with check constraint)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `leases` table
    - Add policy for authenticated users to manage their own leases

  3. Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

CREATE TABLE IF NOT EXISTS public.leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_rent numeric(10,2) NOT NULL DEFAULT 0,
  deposit numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'terminated')),
  lease_type text NOT NULL DEFAULT 'fixed_term' CHECK (lease_type IN ('fixed_term', 'month_to_month')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraint for user_id referencing auth.users
ALTER TABLE public.leases 
ADD CONSTRAINT leases_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own leases
CREATE POLICY "Users can manage their own leases"
ON public.leases FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_leases_updated_at
BEFORE UPDATE ON public.leases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();