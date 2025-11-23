-- Kiki Packaging Backoffice - Database Schema
-- PostgreSQL/Supabase Database Schema
-- 
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Run this script to create all tables
--
-- This schema creates:
-- - user_profiles: User accounts (admin/staff)
-- - packaging_products: Packaging catalog
-- - orders: Customer packaging orders
-- - activity_logs: Audit trail of all actions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with additional profile data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- USER INVITATIONS TABLE
-- ============================================================================
-- Stores pending user invitations sent by admins
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  invite_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  invited_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint for pending invitations (PostgreSQL 15+)
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_invitation 
  ON public.user_invitations(email) 
  WHERE accepted_at IS NULL;

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.user_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON public.user_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_invitations_pending ON public.user_invitations(email) WHERE accepted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all invitations"
  ON public.user_invitations FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create invitations"
  ON public.user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update invitations"
  ON public.user_invitations FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete invitations"
  ON public.user_invitations FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- PACKAGING PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.packaging_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_packaging_products_active ON public.packaging_products(is_active)
  WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_packaging_products_sku ON public.packaging_products(sku);
CREATE INDEX IF NOT EXISTS idx_packaging_products_category ON public.packaging_products(category)
  WHERE category IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.packaging_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies - All authenticated users can view products
CREATE POLICY "Authenticated users can view products"
  ON public.packaging_products FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify products
CREATE POLICY "Admins can insert products"
  ON public.packaging_products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products"
  ON public.packaging_products FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products"
  ON public.packaging_products FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
  packaging_product_id UUID NOT NULL REFERENCES public.packaging_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(packaging_product_id);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending orders
CREATE POLICY "Users can update own pending orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

-- Admins can update any order
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for log queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own activity logs
CREATE POLICY "Users can view own logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- All authenticated users can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_packaging_products_updated_at
  BEFORE UPDATE ON public.packaging_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatically log order creation
CREATE OR REPLACE FUNCTION log_order_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    NEW.user_id,
    'created',
    'order',
    NEW.id,
    jsonb_build_object(
      'quantity', NEW.quantity,
      'total_price', NEW.total_price,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_creation();

-- Automatically log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.user_id,
      'status_changed',
      'order',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample admin user (replace with actual auth.users ID after signup)
-- INSERT INTO public.user_profiles (id, name, email, role)
-- VALUES (
--   'your-auth-user-id-here',
--   'Admin User',
--   'admin@example.com',
--   'admin'
-- );

-- Insert sample packaging products
-- INSERT INTO public.packaging_products (name, description, sku, unit, unit_price, stock_quantity, category)
-- VALUES
--   ('Small Box', 'Small cardboard box (20x20x20 cm)', 'BOX-S-001', 'box', 15.00, 100, 'Boxes'),
--   ('Medium Box', 'Medium cardboard box (40x40x40 cm)', 'BOX-M-001', 'box', 25.00, 75, 'Boxes'),
--   ('Large Box', 'Large cardboard box (60x60x60 cm)', 'BOX-L-001', 'box', 45.00, 50, 'Boxes'),
--   ('Bubble Wrap', 'Bubble wrap roll (50m)', 'WRAP-001', 'roll', 120.00, 30, 'Wrapping'),
--   ('Packing Tape', 'Heavy duty packing tape', 'TAPE-001', 'roll', 35.00, 200, 'Tape');

-- ============================================================================
-- VIEWS (Optional - for convenient querying)
-- ============================================================================

-- View: Orders with user and product details
CREATE OR REPLACE VIEW public.orders_with_details AS
SELECT 
  o.id,
  o.user_id,
  u.name AS user_name,
  u.email AS user_email,
  o.packaging_product_id,
  p.name AS product_name,
  p.unit_price AS product_unit_price,
  o.quantity,
  o.total_price,
  o.status,
  o.notes,
  o.created_at,
  o.updated_at
FROM public.orders o
JOIN public.user_profiles u ON o.user_id = u.id
JOIN public.packaging_products p ON o.packaging_product_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.orders_with_details TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Schema created successfully!
-- Next steps:
-- 1. Create your first admin user via Supabase Auth
-- 2. Add their ID to user_profiles table
-- 3. Start using the API from your Nuxt app
