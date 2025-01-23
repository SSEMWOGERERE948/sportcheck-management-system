/*
  # Create inventory management tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `company` (company_type)
      - `price` (numeric)
      - `stock` (integer)
      - `min_stock` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `stock_movements`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `type` (enum: in, out, transfer)
      - `from_company` (company_type)
      - `to_company` (company_type, for transfers)
      - `recorded_by` (uuid, foreign key to users)
      - `verified_by` (uuid, foreign key to users)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Employees can read products
      - Admins can manage products
      - Employees can create stock movements
      - Admins can verify stock movements
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  company company_type NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock integer NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stock movement type enum
CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'transfer');

-- Create stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  type stock_movement_type NOT NULL,
  from_company company_type NOT NULL,
  to_company company_type,
  recorded_by uuid REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Everyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policies for stock movements
CREATE POLICY "Employees can create stock movements"
  ON stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recorded_by);

CREATE POLICY "Everyone can read stock movements"
  ON stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can verify stock movements"
  ON stock_movements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX products_company_idx ON products(company);
CREATE INDEX products_category_idx ON products(category);
CREATE INDEX stock_movements_product_id_idx ON stock_movements(product_id);
CREATE INDEX stock_movements_recorded_by_idx ON stock_movements(recorded_by);
CREATE INDEX stock_movements_verified_by_idx ON stock_movements(verified_by);

-- Add trigger for products updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();