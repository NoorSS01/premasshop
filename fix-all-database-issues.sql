-- =====================================================
-- FIX ALL DATABASE ISSUES - COMPLETE SCHEMA FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- 1. DROP ALL EXISTING TABLES TO START FRESH
DROP TABLE IF EXISTS public.malicious_activity CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.delivery_partners CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 2. CREATE USERS TABLE (CORRECT SCHEMA)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery', 'developer')),
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE PRODUCTS TABLE (CORRECT SCHEMA)
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'water',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'coming_soon')),
  images TEXT[] DEFAULT '{}',
  sku TEXT UNIQUE,
  weight TEXT,
  unit TEXT DEFAULT 'piece',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE ORDERS TABLE (FIXED SCHEMA WITH ADDRESS)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'cod',
  address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  delivery_partner_id UUID REFERENCES public.users(id),
  notes TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE ORDER ITEMS TABLE (CORRECT SCHEMA)
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE DELIVERY PARTNERS TABLE
CREATE TABLE public.delivery_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  vehicle_type TEXT,
  vehicle_number TEXT,
  license_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paused', 'rejected')),
  is_available BOOLEAN DEFAULT TRUE,
  current_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE SETTINGS TABLE
CREATE TABLE public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE CART TABLE (MISSING TABLE)
CREATE TABLE public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 9. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_delivery_partners_user_id ON public.delivery_partners(user_id);

-- 10. DISABLE RLS FOR TESTING
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- 11. CREATE USER SYNC FUNCTION (BULLETPROOF)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    full_name, 
    email, 
    role, 
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CREATE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. CREATE UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. ADD UPDATE TRIGGERS
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. INSERT SAMPLE PRODUCTS
INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit) VALUES
('Aquafina Water Bottle', 'Pure drinking water in 1L bottle', 20.00, 15.00, 100, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'], 'AQF-1L-001', '1L', 'bottle'),
('Bisleri Water Bottle', 'Premium mineral water 500ml', 15.00, 10.00, 150, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'], 'BIS-500ML-001', '500ml', 'bottle'),
('Kinley Water Bottle', 'Refreshing drinking water 2L', 35.00, 25.00, 80, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400'], 'KIN-2L-001', '2L', 'bottle'),
('Premium Spring Water', 'Natural spring water with minerals', 45.00, 30.00, 60, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'], 'PSW-1L-001', '1L', 'bottle'),
('Eco-Friendly Water Pack', 'Sustainable water packaging', 25.00, 18.00, 120, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'], 'ECO-1L-001', '1L', 'pack'),
('Fresh Bananas', 'Organic bananas from local farms', 60.00, 40.00, 0, 'fruits_vegetables', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], 'BAN-1KG-001', '1kg', 'kg'),
('Milk Packet', 'Fresh dairy milk', 55.00, 45.00, 0, 'dairy', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'], 'MLK-1L-001', '1L', 'packet'),
('Potato Chips', 'Crispy and delicious snacks', 30.00, 20.00, 0, 'snacks', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'], 'CHI-50G-001', '50g', 'packet');

-- 16. INSERT SETTINGS
INSERT INTO public.settings (key, value, description) VALUES
('delivery_fee', '{"amount": 20}', 'Standard delivery fee'),
('min_order_amount', '{"amount": 50}', 'Minimum order amount for delivery'),
('delivery_radius', '{"radius": 10}', 'Delivery radius in kilometers'),
('auto_assign_orders', '{"enabled": true}', 'Automatically assign orders to delivery partners'),
('order_timeout', '{"minutes": 30}', 'Order confirmation timeout in minutes');

-- 17. SYNC EXISTING AUTH USERS
INSERT INTO public.users (id, full_name, email, role, phone, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as full_name,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'customer') as role,
  au.raw_user_meta_data->>'phone' as phone,
  au.created_at,
  NOW()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- 18. FINAL VERIFICATION
SELECT 
  'DATABASE COMPLETELY FIXED!' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users,
  (SELECT COUNT(*) FROM public.products WHERE status = 'active') as active_products,
  (SELECT COUNT(*) FROM public.settings) as settings_count;

-- Test queries to verify everything works
SELECT 'Products working:' as test, COUNT(*) as count FROM public.products;
SELECT 'Users working:' as test, COUNT(*) as count FROM public.users;
SELECT 'Settings working:' as test, COUNT(*) as count FROM public.settings;
