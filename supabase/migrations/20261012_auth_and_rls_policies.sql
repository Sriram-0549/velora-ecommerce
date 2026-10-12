-- ==============================================================================
-- VELORA E-COMMERCE: SUPABASE AUTH & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Ensure 'user_id' column exists on 'orders' table to link Supabase Auth users
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create performance indexes for user queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 2. Enable Row Level Security (RLS) on all core tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow admin full access to products" ON products;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view and manage all orders" ON orders;
DROP POLICY IF EXISTS "Users can view items in their own orders" ON order_items;
DROP POLICY IF EXISTS "Admins can view and manage all order items" ON order_items;

-- ==============================================================================
-- PRODUCTS TABLE POLICIES
-- ==============================================================================

-- Public can read all active catalog products
CREATE POLICY "Allow public read access to products" 
ON products 
FOR SELECT 
USING (true);

-- Only verified administrators can insert, update, or delete products
CREATE POLICY "Allow admin full access to products" 
ON products 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
  OR auth.jwt() ->> 'email' = 'admin@velora.com'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
  OR auth.jwt() ->> 'email' = 'admin@velora.com'
);

-- ==============================================================================
-- ORDERS TABLE POLICIES
-- ==============================================================================

-- Authenticated customers can read ONLY their own orders
CREATE POLICY "Users can view their own orders" 
ON orders 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR LOWER(auth.jwt() ->> 'email') = LOWER(customer_email)
);

-- Administrators can view, update, and manage all orders
CREATE POLICY "Admins can view and manage all orders" 
ON orders 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
  OR auth.jwt() ->> 'email' = 'admin@velora.com'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
  OR auth.jwt() ->> 'email' = 'admin@velora.com'
);

-- ==============================================================================
-- ORDER ITEMS TABLE POLICIES
-- ==============================================================================

-- Authenticated customers can read items only from orders they own
CREATE POLICY "Users can view items in their own orders" 
ON order_items 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR LOWER(orders.customer_email) = LOWER(auth.jwt() ->> 'email')
    )
  )
);

-- Administrators can manage all line items
CREATE POLICY "Admins can view and manage all order items" 
ON order_items 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
  OR auth.jwt() ->> 'email' = 'admin@velora.com'
);

-- ==============================================================================
-- ADMIN ROLE HELPER FUNCTION (Optional convenience)
-- To grant admin rights to any user in Supabase SQL editor:
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@velora.com';
-- ==============================================================================
