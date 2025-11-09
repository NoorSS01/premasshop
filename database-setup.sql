-- =====================================================
-- PREMA'S SHOP - COMPLETE DATABASE SETUP
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery', 'developer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
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

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'cod',
  delivery_address JSONB NOT NULL,
  delivery_partner_id UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Partners table
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  vehicle_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paused', 'deleted')),
  allowed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Malicious Activity table
CREATE TABLE IF NOT EXISTS public.malicious_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  delivery_partner_id UUID REFERENCES public.users(id),
  order_id UUID REFERENCES public.orders(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id ON public.delivery_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON public.delivery_partners(status);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.malicious_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (status = 'active' OR status = 'coming_soon');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and delivery partners can view orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'delivery', 'developer')
    )
  );

CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- Delivery partners policies
CREATE POLICY "Delivery partners can view own profile" ON public.delivery_partners
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can apply as delivery partner" ON public.delivery_partners
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage delivery partners" ON public.delivery_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- Settings policies
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- =====================================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample products
INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit) VALUES
('Aquafina Water Bottle', 'Pure drinking water in 1L bottle', 20.00, 15.00, 100, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'], 'AQF-1L-001', '1L', 'bottle'),
('Bisleri Water Bottle', 'Premium mineral water 500ml', 15.00, 10.00, 150, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'], 'BIS-500ML-001', '500ml', 'bottle'),
('Kinley Water Bottle', 'Refreshing drinking water 2L', 35.00, 25.00, 80, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400'], 'KIN-2L-001', '2L', 'bottle'),
('Premium Spring Water', 'Natural spring water with minerals', 45.00, 30.00, 60, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'], 'PSW-1L-001', '1L', 'bottle'),
('Eco-Friendly Water Pack', 'Sustainable water packaging', 25.00, 18.00, 120, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'], 'ECO-1L-001', '1L', 'pack'),
('Fresh Bananas', 'Organic bananas from local farms', 60.00, 40.00, 0, 'fruits_vegetables', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], 'BAN-1KG-001', '1kg', 'kg'),
('Milk Packet', 'Fresh dairy milk', 55.00, 45.00, 0, 'dairy', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'], 'MLK-1L-001', '1L', 'packet'),
('Potato Chips', 'Crispy and delicious snacks', 30.00, 20.00, 0, 'snacks', 'coming_soon', ARRAY['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'], 'CHI-50G-001', '50g', 'packet');

-- Insert settings
INSERT INTO public.settings (key, value, description) VALUES
('auto_assign_orders', '{"enabled": true}', 'Automatically assign orders to delivery partners'),
('delivery_radius', '{"radius": 10}', 'Delivery radius in kilometers'),
('min_order_amount', '{"amount": 50}', 'Minimum order amount for delivery'),
('delivery_charges', '{"amount": 20}', 'Standard delivery charges');

-- =====================================================
-- 7. CREATE ADMIN USER (OPTIONAL)
-- =====================================================

-- Note: You'll need to create this user through Supabase Auth first,
-- then update their role manually:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Your database is now ready with:
-- ✅ All required tables
-- ✅ Row Level Security policies
-- ✅ Sample products and data
-- ✅ Proper indexes for performance
-- ✅ Triggers for user management
-- ✅ Settings configuration

-- Next steps:
-- 1. Create a user account through your app
-- 2. Update that user's role to 'admin' in the users table
-- 3. Test all functionality

SELECT 'Database setup completed successfully!' as status;
