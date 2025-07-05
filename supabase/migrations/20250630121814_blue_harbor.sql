/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `tenant_id` (uuid, foreign key to tenants)
      - `asset_id` (uuid, foreign key to assets)
      - `amount` (numeric)
      - `due_date` (date)
      - `paid_date` (date, optional)
      - `status` (text with check constraint)
      - `method` (text with check constraint)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policy for users to manage their own payments
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  method text CHECK (method IN ('cash', 'check', 'bank_transfer', 'online')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();