-- Migration: Add missing fields to packaging_products table
-- Run this in Supabase SQL Editor to update the existing schema

-- Add missing columns to packaging_products table
ALTER TABLE public.packaging_products
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Make SKU required and unique (if not already)
UPDATE public.packaging_products SET sku = 'SKU-' || id::text WHERE sku IS NULL;
ALTER TABLE public.packaging_products ALTER COLUMN sku SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_packaging_products_sku ON public.packaging_products(sku);

-- Make unit required (if not already)
UPDATE public.packaging_products SET unit = 'pcs' WHERE unit IS NULL;
ALTER TABLE public.packaging_products ALTER COLUMN unit SET NOT NULL;

-- Create index for category for faster filtering
CREATE INDEX IF NOT EXISTS idx_packaging_products_category ON public.packaging_products(category) WHERE category IS NOT NULL;

-- Update the updated_at timestamp
UPDATE public.packaging_products SET updated_at = NOW();

-- Comments for documentation
COMMENT ON COLUMN public.packaging_products.sku IS 'Stock Keeping Unit - unique identifier for products';
COMMENT ON COLUMN public.packaging_products.unit IS 'Unit of measurement (e.g., box, roll, piece)';
COMMENT ON COLUMN public.packaging_products.category IS 'Product category for grouping and filtering';
COMMENT ON COLUMN public.packaging_products.image_url IS 'URL to product image';
