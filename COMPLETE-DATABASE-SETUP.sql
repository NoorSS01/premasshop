-- =====================================================
-- SUPER SIMPLE DATABASE SETUP - WORKS PERMANENTLY!
-- Run ONCE and forget about it forever!
-- =====================================================

-- Clean slate
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'User',
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  address JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. CREATE PRODUCTS TABLE
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

-- 4. CREATE ORDERS TABLE (WITH PROPER ADDRESS COLUMN)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'COD',
  address JSONB NOT NULL, -- This is the critical column that was missing
  delivery_partner_id UUID REFERENCES public.users(id),
  notes TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE ORDER_ITEMS TABLE
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  product_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE CART_ITEMS TABLE
CREATE TABLE public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
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

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- 9. DISABLE RLS FOR DEVELOPMENT (Enable in production)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Simple user sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'customer',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. INSERT PRODUCTS (BULLETPROOF - INSERTS ONE BY ONE)
-- Clear existing products first
DELETE FROM public.products;

-- Insert products individually
INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Aquafina Water Bottle', 'Pure drinking water in 1L bottle', 20.00, 15.00, 100, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'], 'AQF-1L-001', '1L', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Bisleri Water Bottle', 'Premium mineral water 500ml', 15.00, 10.00, 150, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'], 'BIS-500ML-001', '500ml', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Kinley Water Bottle', 'Refreshing drinking water 2L', 35.00, 25.00, 80, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400'], 'KIN-2L-001', '2L', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Premium Spring Water', 'Natural spring water with minerals', 45.00, 30.00, 60, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'], 'PSW-1L-001', '1L', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Eco-Friendly Water Pack', 'Sustainable water packaging', 25.00, 18.00, 120, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'], 'ECO-1L-001', '1L', 'pack', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Fresh Bananas', 'Organic bananas from local farms', 60.00, 40.00, 0, 'fruits_vegetables', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], 'BAN-1KG-001', '1kg', 'kg', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Milk Packet', 'Fresh dairy milk', 55.00, 45.00, 0, 'dairy', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'], 'MLK-1L-001', '1L', 'packet', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) 
VALUES ('Potato Chips', 'Crispy and delicious snacks', 30.00, 20.00, 0, 'snacks', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'], 'CHI-50G-001', '50g', 'packet', NOW(), NOW());

-- 13. INSERT SETTINGS
INSERT INTO public.settings (key, value, description) VALUES
('delivery_fee', '{"amount": 20}', 'Standard delivery fee'),
('min_order_amount', '{"amount": 50}', 'Minimum order amount for delivery'),
('delivery_radius', '{"radius": 10}', 'Delivery radius in kilometers'),
('auto_assign_orders', '{"enabled": true}', 'Automatically assign orders to delivery partners'),
('order_timeout', '{"minutes": 30}', 'Order confirmation timeout in minutes');

-- Sync existing users
INSERT INTO public.users (id, full_name, email, role, phone)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User') as full_name,
  au.email,
  'customer' as role,
  au.raw_user_meta_data->>'phone' as phone
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Final verification
SELECT 
  '✅ SETUP COMPLETE!' as status,
  (SELECT COUNT(*) FROM public.users) as users_table,
  (SELECT COUNT(*) FROM public.products) as products_table,
  (SELECT COUNT(*) FROM public.orders) as orders_table,
  'Database is ready!' as message;

-- =====================================================
-- ✅ DATABASE SETUP COMPLETE!
-- 
-- What was created:
-- ✅ All tables (users, products, orders, etc.)
-- ✅ 8 Products added (5 water bottles + 3 coming soon)
-- ✅ User sync trigger activated
-- ✅ Settings configured
-- 
-- Check the results above:
-- - products_table should show: 8
-- - If it shows 0, there was an error - check console
-- 
-- Next steps:
-- 1. Hard refresh your browser (Ctrl+Shift+R)
-- 2. Products should load immediately
-- 3. You can add more products through Admin panel later
-- 
-- For Hostinger deployment:
-- - See DEPLOY-INSTRUCTIONS.md file
-- - Use static hosting, NOT PHP hosting
-- =====================================================
