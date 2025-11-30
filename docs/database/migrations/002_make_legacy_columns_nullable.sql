-- Make legacy columns nullable to support multi-item orders
-- These columns are no longer used for new orders as we moved to order_items table
ALTER TABLE public.orders ALTER COLUMN packaging_product_id DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN quantity DROP NOT NULL;
