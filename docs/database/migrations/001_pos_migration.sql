-- Migration: 001_pos_migration.sql
-- Description: Add support for multi-item orders and payment methods

-- 1. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  packaging_product_id UUID NOT NULL REFERENCES public.packaging_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add payment_method to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer'));

-- 3. Migrate existing single-item orders to order_items
-- Only insert if the order doesn't already have items (to prevent duplicates if run multiple times)
INSERT INTO public.order_items (order_id, packaging_product_id, quantity, unit_price, total_price, created_at)
SELECT 
  o.id, 
  o.packaging_product_id, 
  o.quantity, 
  (o.total_price / o.quantity), -- Calculate unit price from total
  o.total_price, 
  o.created_at
FROM public.orders o
WHERE NOT EXISTS (
    SELECT 1 FROM public.order_items oi WHERE oi.order_id = o.id
) AND o.packaging_product_id IS NOT NULL;

-- 4. Make old columns nullable (we keep them for safety for now, or drop them if you are sure)
-- For this plan, we will make them nullable to avoid breaking immediate queries, 
-- but the code should stop using them.
ALTER TABLE public.orders ALTER COLUMN packaging_product_id DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN quantity DROP NOT NULL;

-- 5. Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for order_items

-- Users can view items of their own orders
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_items.order_id 
      AND o.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can create items for their own orders (during order creation)
CREATE POLICY "Users can create own order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_items.order_id 
      AND o.user_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(packaging_product_id);
