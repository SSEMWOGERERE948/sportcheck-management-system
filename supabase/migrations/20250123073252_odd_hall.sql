/*
  # Create sales table and related schemas

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `amount` (numeric)
      - `employee_id` (uuid, foreign key to users)
      - `customer_id` (uuid, foreign key to customers, optional)
      - `is_pending` (boolean)
      - `company` (enum: vargo, sportcheck)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sales` table
    - Add policies for:
      - Employees can create sales
      - Employees can read their own sales
      - Admins can read all sales
*/

-- Create company enum type
CREATE TYPE company_type AS ENUM ('vargo', 'sportcheck');

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  amount numeric NOT NULL CHECK (amount >= 0),
  employee_id uuid REFERENCES auth.users(id),
  customer_id uuid REFERENCES customers(id),
  is_pending boolean DEFAULT false,
  company company_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employees can create sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can read own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = employee_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX sales_employee_id_idx ON sales(employee_id);
CREATE INDEX sales_customer_id_idx ON sales(customer_id);
CREATE INDEX sales_company_idx ON sales(company);
CREATE INDEX sales_created_at_idx ON sales(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();